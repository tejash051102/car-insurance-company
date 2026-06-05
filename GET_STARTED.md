# ⚡ Get Started in 5 Minutes

## Step 1: Update Email Configuration (1 min)

### Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Click "App passwords"
4. Select Mail + Windows Computer
5. Copy the 16-character password

### Update `.env`

```
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Paste the app password here
```

## Step 2: Restart Backend (1 min)

```bash
cd backend
npm run dev
```

Check logs for:

```
[email] SMTP configured: smtp.gmail.com:587
```

## Step 3: Get Admin Token (1 min)

```bash
# Login
curl -X POST http://localhost:5010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@drivesure.com", "password": "Admin@123"}'

# Save the token from response
TOKEN="eyJhbGci..."
```

## Step 4: Get Customer ID (1 min)

```bash
# List customers
curl -X GET http://localhost:5010/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Copy a customer ID
CUSTOMER_ID="507f1f77bcf86cd799439011"
```

## Step 5: Send Verification Code (1 min)

```bash
# Send verification
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/admin-send-verification \
  -H "Authorization: Bearer $TOKEN"

# Success response:
{
  "message": "Verification code sent to customer email",
  "contactOtpSent": true,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}
```

---

## ✅ Done! You're All Set

The feature is working! Here's what just happened:

1. ✅ Admin sent verification code to customer
2. ✅ Email sent to customer (or logged to console if in dev mode)
3. ✅ Customer receives OTP code
4. ✅ Customer can verify using existing `/verify-otp` endpoint

---

## 📧 What Customer Receives

**Email:**

```
Subject: Verify your customer contact

Hello John Doe,

Your DriveSure customer verification code is 123456.

This code expires in 10 minutes.

If you did not request this, please ignore this email.
```

---

## 🎯 Customer Verification Flow

```bash
# Customer has email with OTP: 123456
# Customer logs in and gets their token
CUSTOMER_TOKEN="eyJhbGci..."

# Customer submits verification code
curl -X POST http://localhost:5010/api/customers/$CUSTOMER_ID/verify-otp \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'

# Response: Customer is now verified!
{
  "contactVerified": true,
  "contactVerifiedAt": "2024-12-15T10:30:00.000Z"
}
```

---

## 📚 Need More Details?

- **Email issues?** → See VERIFICATION_EMAIL_SETUP.md
- **Testing?** → See TESTING_GUIDE.md
- **Troubleshooting?** → See QUICK_REFERENCE.md
- **Code details?** → See IMPLEMENTATION_SUMMARY.md

---

## 🆘 Common Issues

| Issue              | Fix                                           |
| ------------------ | --------------------------------------------- |
| 401 Unauthorized   | Add valid admin token in Authorization header |
| 403 Forbidden      | Use admin/manager account, not customer       |
| 404 Not Found      | Verify customer ID is correct                 |
| 503 Email Error    | Check SMTP config in .env                     |
| Email not received | Check spam folder or SMTP settings            |

---

**That's it!** You're ready to use the feature. 🚀
