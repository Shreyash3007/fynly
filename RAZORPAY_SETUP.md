# Razorpay Setup Guide

## ✅ Credentials Configured

Your Razorpay credentials have been added to the codebase:

- **Key ID**: `rzp_test_RgKgEIEVHvX9Dq`
- **Secret**: `U68rkYGX66W5e2FWGVJOSU0Z`

## 🔧 Manual Steps Required

### 1. Add Credentials to Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RgKgEIEVHvX9Dq
RAZORPAY_KEY_ID=rzp_test_RgKgEIEVHvX9Dq
RAZORPAY_KEY_SECRET=U68rkYGX66W5e2FWGVJOSU0Z
```

**Important:** Add these for all environments (Production, Preview, Development).

### 2. Set Up Razorpay Webhook

1. **Get your Vercel deployment URL**
   - After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

2. **Go to Razorpay Dashboard**
   - Visit: https://dashboard.razorpay.com/app/webhooks
   - Or: Dashboard → Settings → Webhooks

3. **Create New Webhook**
   - **Webhook URL**: `https://your-app.vercel.app/api/webhooks/razorpay`
   - **Events to listen**: 
     - ✅ `payment.captured`
     - ✅ `payment.failed`
   - Click **Create Webhook**

4. **Copy Webhook Secret**
   - After creating, Razorpay will show a **Webhook Secret**
   - Copy this secret

5. **Add Webhook Secret to Vercel**
   - Go to Vercel → Settings → Environment Variables
   - Add: `RAZORPAY_WEBHOOK_SECRET=<paste_your_webhook_secret>`
   - Save

### 3. Test Webhook (Optional)

You can test the webhook using Razorpay's test webhook feature:

1. In Razorpay Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Webhook**
4. Check Vercel function logs to verify it's working

## 📋 Checklist

- [ ] Added Razorpay credentials to Vercel environment variables
- [ ] Created webhook in Razorpay Dashboard
- [ ] Added webhook URL: `https://your-app.vercel.app/api/webhooks/razorpay`
- [ ] Selected events: `payment.captured` and `payment.failed`
- [ ] Copied webhook secret from Razorpay
- [ ] Added `RAZORPAY_WEBHOOK_SECRET` to Vercel environment variables
- [ ] Tested webhook (optional but recommended)

## 🔒 Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Webhook secret is required for signature verification
- ✅ All Razorpay secrets should be in Vercel environment variables, not in code

## 🧪 Testing Payments

### Test Mode

Since you're using `rzp_test_*` keys, you're in **Test Mode**:

1. Use Razorpay test cards: https://razorpay.com/docs/payments/test-card-details/
2. Example test card:
   - **Card Number**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

### Production Mode

When ready for production:
1. Switch to live keys (`rzp_live_*`)
2. Update environment variables in Vercel
3. Test with real payments (small amounts first)

## 📞 Support

If you encounter issues:
- Check Vercel function logs for webhook errors
- Verify webhook secret matches in both Razorpay and Vercel
- Ensure webhook URL is accessible (HTTPS required)
- Check Razorpay Dashboard → Webhooks → Logs for delivery status

