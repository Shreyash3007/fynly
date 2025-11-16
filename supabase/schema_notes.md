# Supabase Schema & RLS Notes

## Overview

This document explains the database schema, Row Level Security (RLS) policies, and security recommendations for the Fynly MVP.

## Schema Structure

### Tables

1. **advisors** - Financial advisors registered on the platform
2. **investors** - Individual investors seeking financial advice
3. **submissions** - Investor questionnaire submissions and matching data

### Key Design Decisions

- **UUIDs**: All primary keys use UUIDs generated via `gen_random_uuid()` (requires pgcrypto extension)
- **JSONB**: Submissions store questionnaire responses as JSONB for flexibility
- **Timestamps**: All tables have `created_at` and `updated_at` with automatic triggers
- **Indexes**: Strategic indexes on foreign keys, search fields, and JSONB columns

## Row Level Security (RLS)

RLS is **enabled** on all tables to enforce data access policies at the database level.

### Current Policy Configuration

**Note**: The current RLS policies are permissive for development. In production, they should be restricted using `auth.uid()` checks and service role validation.

#### Advisors Table

- **SELECT**: Public read access (advisors are searchable)
- **INSERT/UPDATE/DELETE**: Currently permissive (should be restricted to service role in production)

#### Investors Table

- **SELECT**: Currently permissive (should restrict to own data: `auth.uid() = id`)
- **INSERT/UPDATE/DELETE**: Currently permissive (should be restricted to service role in production)

#### Submissions Table

- **SELECT**: Currently permissive (should restrict to own submissions or assigned advisor)
- **INSERT/UPDATE/DELETE**: Currently permissive (should be restricted to service role in production)

### Production RLS Recommendations

For production, update policies to:

```sql
-- Example: Investors can only view their own data
CREATE POLICY "Investors can view own data"
  ON investors FOR SELECT
  USING (auth.uid()::text = id::text);

-- Example: Submissions restricted to owner or assigned advisor
CREATE POLICY "Submissions viewable by owner or advisor"
  ON submissions FOR SELECT
  USING (
    auth.uid()::text = investor_id::text OR
    auth.uid()::text = advisor_id::text
  );
```

## Security Best Practices

### 1. Server-Side API Routes

**CRITICAL**: All write operations (INSERT, UPDATE, DELETE) should be routed through server-side API routes using the `SUPABASE_SERVICE_ROLE_KEY`.

**Why?**

- Service role key bypasses RLS policies
- Allows controlled, validated operations
- Prevents direct client-side database manipulation
- Enables business logic validation

**Example Structure:**

```
app/
  api/
    investors/
      route.ts        # POST /api/investors (create)
      [id]/
        route.ts      # PUT /api/investors/[id] (update)
    submissions/
      route.ts        # POST /api/submissions (create)
```

### 2. Environment Variables

**Server-Only Variables** (never expose to client):

- `SUPABASE_SERVICE_ROLE_KEY` - Use only in API routes, never in client components

**Public Variables** (safe for client):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Authentication Integration

When implementing authentication (Phase 3+):

- Use Supabase Auth for user authentication
- Map Supabase Auth users to `investors` or `advisors` tables
- Use `auth.uid()` in RLS policies to restrict access
- Store user metadata in Supabase Auth or custom user table

### 4. Data Validation

- Validate all inputs in API routes before database operations
- Use TypeScript types to ensure data shape
- Sanitize user inputs to prevent SQL injection (Supabase client handles this)
- Validate JSONB structure for submissions.responses

## Indexes

### Performance Indexes

- **Email indexes**: Fast lookups for authentication/login
- **Foreign key indexes**: Optimize JOIN operations
- **Status index**: Filter submissions by status efficiently
- **GIN indexes**: Full-text search on arrays (specializations) and JSONB (responses)

### Query Optimization

Common queries that benefit from indexes:

```sql
-- Find advisor by email (uses idx_advisors_email)
SELECT * FROM advisors WHERE email = 'advisor@example.com';

-- Find submissions for investor (uses idx_submissions_investor_id)
SELECT * FROM submissions WHERE investor_id = '...';

-- Search advisors by specialization (uses GIN index)
SELECT * FROM advisors WHERE 'Retirement Planning' = ANY(specializations);

-- Filter submissions by status (uses idx_submissions_status)
SELECT * FROM submissions WHERE status = 'pending';
```

## Triggers

### Automatic Timestamp Updates

All tables have triggers that automatically update `updated_at` on row modification:

```sql
CREATE TRIGGER update_<table>_updated_at
  BEFORE UPDATE ON <table>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Migration Strategy

1. **Initial Setup**: Run `sql/create_tables.sql` in Supabase SQL Editor
2. **Seed Data**: Import seed data using methods in `scripts/seed_readme.md`
3. **Future Migrations**: Create migration files in `supabase/migrations/` (if using Supabase CLI)

## Monitoring & Maintenance

### Useful Queries

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

## Next Steps

- Phase 3: Implement authentication and update RLS policies
- Phase 4+: Add business logic and scoring calculations
- Production: Restrict RLS policies and add audit logging
