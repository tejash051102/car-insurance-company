# Email Verification Setup & Admin Verification Feature

## 🔧 Fixing the ENETUNREACH Email Error

### Problem
```
Verification email could not be sent: connect ENETUNREACH 2607:f8b0:400e:c0a::6d:587 - Local (:::0)
```

This error means the application cannot reach the SMTP server. The IPv6 address `2607:f8b0:400e:c0a::6d:587` is Google's SMTP server.

### Root Causes & Solutions

#### 1. **Invalid Gmail Credentials**
**Check:** Your `.env` file has valid Gmail credentials
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # NOT your Gmail password!
```

**Solution for Gmail:**
1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "App passwords" (appears only if 2FA enabled)
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
3. Update `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Your app password (with spaces)
   ```

#### 2. **Network/Firewall Issues**
If credentials are correct but still failing:

**Check your network:**
```powershell
# Test connection to Gmail SMTP
Test-NetConnection smtp.gmail.com -Port 587

# Result should show TcpTestSucceeded: True
```

**Solutions:**
- Check if firewall blocks port 587
- If on corporate network, contact IT to whitelist:
  - Host: `smtp.gmail.com`
  - Port: `587`
  - Protocol: TLS

#### 3. **IPv6 Issues** (Most Common with ENETUNREACH)
The application has been updated to force IPv4:
```javascript
family: 4,  // Force IPv4 only
```

If still failing:
- Your ISP/network may not have proper IPv6 support
- Contact your network administrator
- Try using a VPN or mobile hotspot for testing

### Testing Email Configuration

**Development Mode (No SMTP):**
If SMTP is not configured, emails are logged to console:
```javascript
if (!hasSmtpConfig()) {
  console.log(`[email:dev] ${subject} -> ${to}`);
  console.log(text);
  return { skipped: true, reason: "SMTP not configured" };
}
```

**Testing with Gmail:**
1. Fill in valid credentials in `.env`
2. Start the server
3. Check console logs for connection details:
   ```
   [email] SMTP configured: smtp.gmail.com:587
   ```
4. Trigger an email action and check logs for:
   - `[email:success]` - Email sent successfully
   - `[email:retry]` - Retry attempts were needed
   - `[email:failed]` - Email failed after retries

---

## ✨ New Admin/Manager Verification Feature

### Overview
Admins and Managers can now manually send customer verification codes via email, enabling them to:
- Verify customers who didn't receive the original email
- Re-verify customers when needed
- Manually trigger verification as part of onboarding

### API Endpoint

**Send Verification Code to Customer**
```
POST /api/customers/{customerId}/admin-send-verification
Authorization: Bearer {token}
```

#### Requirements
- **Authentication:** Required (user must be logged in)
- **Authorization:** Admin or Manager role only
- **Customer:** Must be accessible to the requesting user

#### Response (Success - 200)
```json
{
  "message": "Verification code sent to customer email",
  "contactOtpSent": true,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}
```

#### Response (Error - 404)
```json
{
  "message": "Customer not found"
}
```

#### Response (Error - 503, Email Service Down)
```json
{
  "message": "Verification email could not be sent: [error details]"
}
```

### Usage Examples

#### Using cURL
```bash
curl -X POST http://localhost:5010/api/customers/507f1f77bcf86cd799439011/admin-send-verification \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Using JavaScript/Fetch
```javascript
const response = await fetch('/api/customers/{customerId}/admin-send-verification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.message);
```

#### Using Postman
1. Set method to `POST`
2. URL: `http://localhost:5010/api/customers/{customerId}/admin-send-verification`
3. Headers:
   - `Authorization: Bearer {your_token}`
   - `Content-Type: application/json`
4. Click Send

### What Happens When Called

1. **Verification:** Admin/Manager and customer permissions checked
2. **OTP Generation:** 6-digit OTP created with 10-minute expiry
3. **Email Sending:** Verification email sent to customer
   - Email contains the OTP code
   - Explains the purpose
   - Shows expiration time
4. **Audit Logging:** Action recorded with:
   - Admin/Manager who sent it
   - Customer email
   - Timestamp
5. **Response:** Confirmation sent back with customer details

### Email Content Sent to Customer

**Subject:** Verify your customer contact

**Body:**
```
Hello John Doe,

Your DriveSure customer verification code is 123456.

This code expires in 10 minutes.

If you did not request this, please ignore this email.
```

### Customer Completes Verification

Once customer receives the OTP, they use the existing verification endpoint:

```
POST /api/customers/{customerId}/verify-otp
Content-Type: application/json

{
  "otp": "123456"
}
```

### Audit Trail

All verification code sends are logged in the activity log with:
- **User:** Which admin/manager sent the code
- **Customer:** Which customer received it
- **Action:** "sent_verification_code"
- **Timestamp:** When it was sent
- **IP Address:** Where the request came from

To view audit logs:
```javascript
// Activity logs are accessible via activity controller/routes
```

---

## 🚀 Enhanced Email Service Features

### Improvements Made

1. **Retry Logic**
   - Automatically retries failed emails up to 2 times
   - Uses exponential backoff: 1s → 2s → 4s (max 5s)
   - Logs retry attempts

2. **Better Error Handling**
   - Detailed error logging with error codes
   - Distinguishes between different failure types
   - Graceful degradation

3. **Increased Timeouts**
   - Connection timeout: 30 seconds (was 20s)
   - Greeting timeout: 30 seconds (was 20s)
   - Socket timeout: 30 seconds (was 20s)
   - Better for slow networks

4. **Configuration Validation**
   - Validates SMTP config on startup
   - Checks for placeholder values
   - Logs configuration details

5. **Logging Levels**
   ```
   [email:dev]         - Dev mode (no SMTP configured)
   [email]             - Normal operations
   [email:retry]       - Retry attempts
   [email:failed]      - Final failure
   [email:error_details] - Detailed error info
   ```

---

## 🧪 Testing the Setup

### Test 1: Email Configuration
```bash
# Check if SMTP is properly configured
curl -X GET http://localhost:5010/api/health
# Should show SMTP configuration in response (if available)
```

### Test 2: Send Verification Code (Admin)
```bash
# 1. Get admin token by logging in
# 2. Get a customer ID
# 3. Send verification code
curl -X POST http://localhost:5010/api/customers/{customerId}/admin-send-verification \
  -H "Authorization: Bearer {admin_token}"
```

### Test 3: Verify Code (Customer)
```bash
# Customer uses the OTP received in email
curl -X POST http://localhost:5010/api/customers/{customerId}/verify-otp \
  -H "Authorization: Bearer {customer_token}" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'
```

### Test 4: Check Audit Log
```bash
# View activity logs to confirm admin sent verification
curl -X GET http://localhost:5010/api/activities \
  -H "Authorization: Bearer {admin_token}" \
  | grep "sent_verification_code"
```

---

## 📋 Environment Variables Reference

### SMTP Configuration
```env
# Gmail SMTP Server
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # TLS, not SSL

# Gmail App Password (16 chars, spaces preserved)
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Email Display Name
SMTP_FROM_NAME=DriveSure
SMTP_FROM=your-email@gmail.com

# Optional: Timeout Settings (milliseconds)
SMTP_CONNECTION_TIMEOUT=30000
SMTP_GREETING_TIMEOUT=30000
SMTP_SOCKET_TIMEOUT=30000
```

### For Other Email Services

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

---

## ❓ Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `ENETUNREACH` | Can't reach SMTP server | Check network, firewall, DNS |
| `ENOTFOUND smtp.gmail.com` | DNS resolution failed | Check DNS settings, use 8.8.8.8 |
| `Invalid login` | Wrong credentials | Generate new Gmail App Password |
| `timeout` | Connection too slow | Increase timeout values in .env |
| `TLS connection required` | Security not enabled properly | Ensure SMTP_SECURE=false for port 587 |

---

## 📞 Support

For issues with:
- **Email delivery:** Check SMTP credentials and network connectivity
- **API functionality:** Check authorization headers and customer access
- **Verification flow:** Ensure OTP hasn't expired (10 minutes)

Check server logs for detailed error messages with `[email:` prefix.
