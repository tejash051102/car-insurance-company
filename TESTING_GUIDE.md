# Email Verification Feature - Testing Guide

## Quick Start

### Prerequisites
1. Backend server running on `http://localhost:5010`
2. Admin/Manager user account logged in
3. Customer account that needs verification
4. Postman or cURL for API testing

---

## Test Scenario 1: Admin Sends Verification Code

### Step 1: Get Admin Token
```bash
# Login as admin
curl -X POST http://localhost:5010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@drivesure.com",
    "password": "Admin@123"
  }'

# Response:
{
  "_id": "507f1f77bcf86cd799439001",
  "email": "admin@drivesure.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Save the token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Get a Customer ID
```bash
# List customers
curl -X GET http://localhost:5010/api/customers \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response: List of customers with IDs
# Copy a customer ID
CUSTOMER_ID="507f1f77bcf86cd799439011"
```

### Step 3: Admin Sends Verification Code
```bash
# Send verification code to customer
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "message": "Verification code sent to customer email",
  "contactOtpSent": true,
  "customerEmail": "john@example.com",
  "customerName": "John Doe"
}
```

### Step 4: Check Server Logs
Look for logs indicating email was sent:
```
[email:retry] Attempt 1 failed: ...   (if initial failure)
[email:retry] Successfully sent after 1 retry attempt(s)
```

Or in dev mode (no SMTP configured):
```
[email:dev] Verify your customer contact -> john@example.com
Hello John Doe,
Your DriveSure customer verification code is 123456.
...
```

### Step 5: Verify Activity Log
```bash
# Check audit trail
curl -X GET "http://localhost:5010/api/activities?action=sent_verification_code" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should show: "Sent verification code to John Doe (john@example.com)"
```

---

## Test Scenario 2: Manager Sends Verification Code

### Step 1: Get Manager Token
```bash
curl -X POST http://localhost:5010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@drivesure.com",
    "password": "Manager@123"
  }'

# Save token as MANAGER_TOKEN
```

### Step 2: Send Verification to Accessible Customer
```bash
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# Manager can only send to customers they have access to
# Response will be 403 Forbidden if customer not accessible
```

---

## Test Scenario 3: Customer Verifies with OTP

### Step 1: Get Customer Token
```bash
curl -X POST http://localhost:5010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Customer@123"
  }'

# Save token as CUSTOMER_TOKEN
```

### Step 2: Get OTP from Email
In development mode, check server logs:
```
[email:dev] ... Your DriveSure customer verification code is 123456.
```

In production with email, customer receives email with OTP.

### Step 3: Customer Submits OTP
```bash
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/verify-otp \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'

# Expected Response (200 OK):
{
  "contactVerified": true,
  "contactVerifiedAt": "2024-12-15T10:30:00.000Z",
  "message": "Customer contact verified successfully"
}
```

---

## Test Scenario 4: Permission Testing

### Test 4A: Customer Cannot Send Verification to Another Customer
```bash
curl -X POST http://localhost:5010/api/customers/$OTHER_CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# Expected Response (403 Forbidden):
{
  "message": "You do not have permission to perform this action"
}
```

### Test 4B: Unauthenticated User Cannot Send
```bash
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification

# Expected Response (401 Unauthorized):
{
  "message": "Not authorized, no token"
}
```

### Test 4C: Agent Cannot Send (Only Admin/Manager)
```bash
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $AGENT_TOKEN"

# Expected Response (403 Forbidden):
{
  "message": "You do not have permission to perform this action"
}
```

---

## Test Scenario 5: Error Conditions

### Test 5A: Invalid Customer ID
```bash
curl -X POST http://localhost:5010/api/customers/invalid-id/admin-send-verification \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response (404 Not Found):
{
  "message": "Customer not found"
}
```

### Test 5B: Invalid OTP
```bash
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/verify-otp \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"otp": "999999"}'

# Expected Response (401 Unauthorized):
{
  "message": "Invalid or expired customer verification code"
}
```

### Test 5C: Expired OTP (>10 minutes)
```bash
# Wait 10+ minutes after OTP was sent
# Then try to verify with valid OTP

curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/verify-otp \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"otp": "123456"}'

# Expected Response (401 Unauthorized):
{
  "message": "Invalid or expired customer verification code"
}
```

---

## Test Scenario 6: Email Configuration

### Test 6A: SMTP Not Configured (Dev Mode)
Check that emails appear in console logs instead of attempting to send:
```
[email:dev] Verify your customer contact -> customer@example.com
Hello John Doe,
Your DriveSure customer verification code is 123456.
...
```

### Test 6B: Invalid Credentials
If SMTP credentials are incorrect:
```
[email:failed] Verify your customer contact -> customer@example.com: Invalid login
[email:error_details] { code: 'EAUTH', ... }
```

### Test 6C: Network Unreachable
```
[email:failed] Verify your customer contact -> customer@example.com: connect ENETUNREACH ...
[email:error_details] { code: 'ENETUNREACH', errno: -4056, syscall: 'connect', hostname: 'smtp.gmail.com' }
```

---

## Postman Collection

### Save as `.postman_environment.json`
```json
{
  "name": "Car Insurance Local",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:5010/api",
      "enabled": true
    },
    {
      "key": "admin_token",
      "value": "",
      "enabled": true
    },
    {
      "key": "customer_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "otp_code",
      "value": "123456",
      "enabled": true
    }
  ]
}
```

### Postman Request Examples

**1. Admin Login**
- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Body:
```json
{
  "email": "admin@drivesure.com",
  "password": "Admin@123"
}
```
- In Tests tab, extract token:
```javascript
pm.environment.set("admin_token", pm.response.json().token);
```

**2. Send Verification (Admin)**
- Method: `POST`
- URL: `{{base_url}}/customers/{{customer_id}}/admin-send-verification`
- Headers: `Authorization: Bearer {{admin_token}}`
- Body: None (empty POST)

**3. Verify OTP (Customer)**
- Method: `POST`
- URL: `{{base_url}}/customers/{{customer_id}}/verify-otp`
- Headers: `Authorization: Bearer {{customer_token}}`
- Body:
```json
{
  "otp": "{{otp_code}}"
}
```

---

## Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Admin sends verification | OTP sent to customer email, activity logged |
| Manager sends verification | OTP sent to customer email, activity logged |
| Customer enters valid OTP | Contact marked verified, `contactVerified: true` |
| Customer enters invalid OTP | 401 error, contact still unverified |
| Customer enters expired OTP | 401 error, contact still unverified |
| Non-admin sends verification | 403 Forbidden error |
| Unauthenticated request | 401 Unauthorized error |
| Invalid customer ID | 404 Not Found error |

---

## Debugging Tips

### Check Email Service Status
Look at server logs for `[email:` prefix messages:
```
[email] SMTP configured: smtp.gmail.com:587
[email:dev] [subject] -> [email]
[email:retry] Attempt 1 failed: ...
[email:failed] [subject] -> [email]: [error]
```

### Check Activity Log
```bash
curl "http://localhost:5010/api/activities?entityType=Customer&action=sent_verification_code" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Check Customer Data
```bash
curl http://localhost:5010/api/customers/$CUSTOMER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Look for:
# - contactVerified: true/false
# - contactVerifiedAt: timestamp or null
```

### Enable Debug Logging
Add to `.env`:
```env
NODE_ENV=development
```

This enables detailed SMTP logs.

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 503 Service Unavailable | SMTP not configured or unreachable | Check `.env`, ensure credentials valid |
| 401 Invalid OTP | Wrong code or expired | Check logs for OTP, ensure within 10 mins |
| 403 Permission Denied | User not admin/manager | Use admin/manager account |
| 404 Customer Not Found | Invalid customer ID or access restriction | Verify customer exists, user has access |
| Email not received | SMTP issues, invalid email | Check logs for `[email:failed]` |

