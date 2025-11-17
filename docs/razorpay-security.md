# Razorpay Integration Security Notes

## Environment Variables

**CRITICAL**: Razorpay keys must be server-only environment variables. Never expose them to client-side code.

### Required Environment Variables

- `RAZORPAY_KEY_ID` - Razorpay API key ID (server-only)
- `RAZORPAY_KEY_SECRET` - Razorpay API key secret (server-only)
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook secret for signature verification (server-only)

### Security Best Practices

1. **Never log keys**: The Razorpay wrapper logs that a client is being created but never logs the actual key values.

2. **Server-side only**: All Razorpay operations are performed in API routes (`src/app/api/**`) which run server-side only.

3. **Webhook signature verification**: All webhook requests are verified using HMAC-SHA256 signature verification before processing.

4. **Service role key**: Database operations use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. This is intentional for payment processing but should be restricted to server-side API routes only.

## Implementation Details

### API Routes

- `/api/report/create` - Creates Razorpay orders (requires authentication)
- `/api/link-session` - Links anonymous sessions to authenticated users
- `/api/webhooks/razorpay` - Handles Razorpay webhook events (signature verified)

### Authentication

Currently uses temporary Bearer token authentication. **TODO**: Replace with proper Supabase Auth flow in production.

### Webhook Security

- All webhooks verify HMAC-SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`
- Invalid signatures return 400 Bad Request
- Missing signatures return 400 Bad Request
- Uses constant-time comparison to prevent timing attacks

## Testing

All endpoints are tested with mocked Razorpay and Supabase clients to avoid exposing keys during testing.
