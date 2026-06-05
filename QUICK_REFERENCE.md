# Quick Reference: Admin Verification Feature

## 🎯 The Problem & Solution

### Problem
```
Verification email could not be sent: connect ENETUNREACH 2607:f8b0:400e:c0a::6d:587
```

### What We Fixed
1. ✅ Enhanced email service with retry logic
2. ✅ Forced IPv4 connection (prevents ENETUNREACH)
3. ✅ Better error logging for debugging
4. ✅ **NEW:** Admin/Manager can send verification codes to customers

---

## 🆕 New Feature: Admin Verification

### What It Does
Admins and Managers can now manually send customer verification codes via email.

### When to Use It
- Customer didn't receive original verification email
- Customer lost/forgotten their verification code
- Re-verifying customer as part of onboarding
- Manually verifying customers who can't access email

---

## 🔌 API Endpoint

```
POST /api/customers/{customerId}/admin-send-verification
```

### Authorization
- ✅ Admin role
- ✅ Manager role  
- ❌ Customer role
- ❌ Agent role

### What Happens
1. System checks user is admin/manager
2. System generates 6-digit OTP (10-min expiry)
3. Email sent to customer with OTP
4. Action logged for audit trail
5. Response confirms email sent

---

## 📧 Using the Feature

### cURL Example
```bash
curl -X POST http://localhost:5010/api/customers/507f1f77bcf86cd799439011/admin-send-verification \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### JavaScript Example
```javascript
const response = await fetch('/api/customers/{customerId}/admin-send-verification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.message); // "Verification code sent to customer email"
```

### Postman
1. **Method:** POST
2. **URL:** `http://localhost:5010/api/customers/{customerId}/admin-send-verification`
3. **Headers:** `Authorization: Bearer {token}`
4. **Body:** Empty (none)
5. **Click:** Send

---

## ✅ Success Response

```json
{
  "message": "Verification code sent to customer email",
  "contactOtpSent": true,
  "customerEmail": "john@example.com",
  "customerName": "John Doe"
}
```

---

## ❌ Error Responses

### 401 - Not Authenticated
```json
{
  "message": "Not authorized, no token"
}
```
**Fix:** Add valid token in Authorization header

### 403 - Not Authorized
```json
{
  "message": "You do not have permission to perform this action"
}
```
**Fix:** Use admin/manager account, not customer/agent

### 404 - Customer Not Found
```json
{
  "message": "Customer not found"
}
```
**Fix:** Verify customer ID exists and is accessible to you

### 503 - Email Service Error
```json
{
  "message": "Verification email could not be sent: [error details]"
}
```
**Fix:** Check SMTP configuration and network connectivity

---

## 📧 Email Content

**Subject:** Verify your customer contact

**Body:**
```
Hello John Doe,

Your DriveSure customer verification code is 123456.

This code expires in 10 minutes.

If you did not request this, please ignore this email.
```

---

## 🔐 Security

- Only admin/manager can access
- Permission checks enforce data access boundaries
- All actions logged with timestamps and user info
- OTP is 6 digits with 10-minute expiry
- OTP stored hashed (not plaintext)

---

## 🧪 Quick Test

```bash
# 1. Get admin token
ADMIN_TOKEN="your_admin_token_here"

# 2. Get customer ID
CUSTOMER_ID="507f1f77bcf86cd799439011"

# 3. Send verification
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# 4. Check response
# Should see: "Verification code sent to customer email"
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 error | Add `Authorization: Bearer {token}` header |
| 403 error | Use admin/manager account |
| 404 error | Verify customer exists |
| 503 error | Check SMTP config in .env |
| Email not received | Check server logs, spam folder, SMTP settings |

---

## 📋 Audit Trail

All verification sends are logged. View activity:
```bash
curl "http://localhost:5010/api/activities?action=sent_verification_code" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Shows:
- Who sent it (admin/manager)
- When it was sent (timestamp)
- Which customer received it
- What was sent (action details)

---

## 📚 Full Documentation

For complete setup and troubleshooting:
- **VERIFICATION_EMAIL_SETUP.md** - Email configuration
- **TESTING_GUIDE.md** - Testing procedures
- **IMPLEMENTATION_SUMMARY.md** - Technical details

---

## ⚡ Common Tasks

### Send verification to one customer
```bash
curl -X POST http://localhost:5010/api/customers/$ID/admin-send-verification \
  -H "Authorization: Bearer $TOKEN"
```

### View customer verification status
```bash
curl http://localhost:5010/api/customers/$ID \
  -H "Authorization: Bearer $TOKEN" \
  | grep contactVerified
```

### Check email logs
Search server logs for:
```
[email:dev]     - Dev mode (no SMTP)
[email:retry]   - Email retry
[email:failed]  - Email failed
```

---

## 📞 Need Help?

Check server logs for:
```
[email:error_details] { code: '...', errno: ..., syscall: '...', hostname: '...' }
```

This tells you exactly what went wrong with the email.

**Common codes:**
- `ENETUNREACH` - Can't reach SMTP server (IPv6/network issue)
- `ENOTFOUND` - DNS can't resolve hostname
- `EAUTH` - Invalid credentials
- `ETIMEDOUT` - Connection timeout

---

**Ready to use!** The feature is fully implemented and tested. 🚀
