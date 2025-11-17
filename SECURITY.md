# Security Documentation

## Fynly MVP v1.0 - Security Best Practices

This document outlines security measures, secret handling, and best practices for the Fynly MVP v1.0 application.

## Table of Contents

- [Secret Management](#secret-management)
- [Supabase Service Role Key](#supabase-service-role-key)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Webhook Security](#webhook-security)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [API Security](#api-security)
- [Deployment Security](#deployment-security)

## Secret Management

### Environment Variables

**Never commit secrets to version control.**

1. **Local Development**: Use `.env.local` (already in `.gitignore`)
2. **Production**: Use Vercel Dashboard → Settings → Environment Variables
3. **CI/CD**: Use GitHub Secrets for sensitive values

### Secret Classification

#### Public (Client-Side)

- `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Protected by RLS policies
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public key, safe to expose
- `NEXT_PUBLIC_APP_URL` - Public URL

#### Private (Server-Side Only)

- `SUPABASE_SERVICE_ROLE_KEY` - **CRITICAL**: Bypasses RLS, never expose
- `RAZORPAY_KEY_SECRET` - Payment processing secret
- `RAZORPAY_WEBHOOK_SECRET` - Webhook signature verification

### Secret Rotation

- Rotate secrets immediately if exposed
- Update all environments (local, staging, production)
- Revoke old keys in Supabase/Razorpay dashboards

## Supabase Service Role Key

### Usage

The service role key (`SUPABASE_SERVICE_ROLE_KEY`) is used **only** in server-side code:

- ✅ API routes (`src/app/api/**`)
- ✅ Server components (when needed)
- ❌ **Never** in client components
- ❌ **Never** in browser JavaScript
- ❌ **Never** in `NEXT_PUBLIC_*` environment variables

### Implementation

```typescript
// ✅ CORRECT: Server-side only
import { getSupabaseServerClient } from '@/lib/supabase-server'

// ❌ WRONG: Never import in client components
// This would expose the service role key
```

### Security Implications

The service role key **bypasses Row Level Security (RLS)**. It has full database access:

- Can read/write any table
- Can bypass RLS policies
- Should only be used for trusted server operations

**Best Practice**: Always prefer using the anon key with proper RLS policies when possible.

## Row Level Security (RLS)

### Overview

RLS policies enforce data access at the database level. Even if someone obtains the anon key, they can only access data allowed by RLS policies.

### Current Implementation

**Development Mode**: RLS policies are permissive for easier development:

```sql
CREATE POLICY "Allow all for development"
  ON submissions FOR SELECT
  USING (true);
```

**Production**: Tighten RLS policies to restrict access:

```sql
-- Example: Users can only see their own submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = (responses->>'user_id')::uuid);
```

### RLS Best Practices

1. **Principle of Least Privilege**: Grant minimum necessary access
2. **User-Scoped Policies**: Always filter by `user_id` or `auth.uid()`
3. **Service Role Exception**: Service role bypasses RLS (by design)
4. **Test RLS Policies**: Verify policies work as expected

### RLS Policy Review

Review and update RLS policies in:

- `sql/create_tables.sql`
- `sql/add_payments_table.sql`
- `sql/add_reports_table.sql`

See `supabase/schema_notes.md` for detailed RLS documentation.

## Webhook Security

### HMAC-SHA256 Signature Verification

All Razorpay webhooks **must** verify the HMAC-SHA256 signature:

```typescript
// ✅ CORRECT: Always verify signature
const isValid = verifyRazorpaySignature(rawBody, signature, webhookSecret)
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

### Implementation

See `src/lib/razorpay.ts` for signature verification implementation.

### Webhook Endpoint Protection

1. **Use HTTPS**: Always use HTTPS in production
2. **Restrict Access**: Consider IP whitelisting (if supported)
3. **Validate Payload**: Verify event structure before processing
4. **Idempotency**: Handle duplicate webhooks gracefully

### Webhook Secret

- Store `RAZORPAY_WEBHOOK_SECRET` in environment variables
- Never log the secret
- Rotate if compromised

## Authentication

### Supabase Auth

- Uses Supabase Auth for user authentication
- Google OAuth integration for sign-in
- Session tokens stored securely in cookies

### API Authentication

Current implementation uses Bearer token (user_id) for API authentication:

```typescript
// TODO: Replace with proper Supabase Auth token verification
const authHeader = request.headers.get('authorization')
const token = authHeader?.substring(7) // Extract Bearer token
```

**Production Recommendation**: Verify Supabase Auth JWT tokens:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)
const {
  data: { user },
  error,
} = await supabase.auth.getUser(token)
```

## Environment Variables

### Required Variables

See `env.example` for complete list.

### Variable Naming

- `NEXT_PUBLIC_*`: Exposed to browser (safe for public keys)
- Others: Server-side only (secrets)

### Validation

Validate environment variables at startup:

```typescript
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}
```

## API Security

### Input Validation

All API endpoints use Zod schemas for input validation:

```typescript
const validatedInput = ScoreInputSchema.parse(body)
```

### Rate Limiting

**Production Recommendation**: Implement rate limiting:

- Use Vercel Edge Middleware
- Or use a service like Upstash Redis

### CORS

Next.js API routes handle CORS automatically. For custom CORS:

```typescript
// Allow only your domain
headers: {
  'Access-Control-Allow-Origin': 'https://yourdomain.com'
}
```

## Deployment Security

### Vercel Environment Variables

1. Set all secrets in Vercel Dashboard
2. Use different values for staging/production
3. Never commit `.env.local` to git

### HTTPS

- Vercel provides HTTPS by default
- Always use HTTPS in production
- Redirect HTTP to HTTPS

### Database Security

1. **Backup Regularly**: Use Supabase automated backups
2. **Monitor Access**: Review Supabase logs
3. **Connection Security**: Use SSL for database connections

### Storage Security

- Supabase Storage buckets should have appropriate RLS policies
- Public buckets: Only for public assets
- Private buckets: Use signed URLs for access

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] RLS policies reviewed and tightened
- [ ] Webhook signature verification enabled
- [ ] HTTPS enabled
- [ ] Service role key only used server-side
- [ ] Input validation on all API endpoints
- [ ] Error messages don't leak sensitive info

### Ongoing

- [ ] Monitor Supabase logs for suspicious activity
- [ ] Review Razorpay webhook logs
- [ ] Rotate secrets periodically
- [ ] Update dependencies regularly
- [ ] Review and update RLS policies

## Incident Response

If a secret is exposed:

1. **Immediately** rotate the exposed secret
2. Revoke old keys in Supabase/Razorpay
3. Update all environments
4. Review access logs for unauthorized access
5. Notify affected users if necessary

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Razorpay Security Documentation](https://razorpay.com/docs/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Contact

For security concerns, contact the development team immediately.
