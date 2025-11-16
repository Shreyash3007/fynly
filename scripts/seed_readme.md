# Seed Data Generation & Import Guide

This guide explains how to generate and import seed data for the Fynly MVP database.

## Prerequisites

1. Install dependencies:

```bash
npm install
```

2. Ensure you have Node.js >= 18 installed.

## Generating Seed Data

The seed generator creates two dataset sizes:

- **Small**: 50 advisors, 200 investors (for development/testing)
- **Large**: 100 advisors, 10,000 investors (for load testing)

### Using TypeScript directly (recommended)

If you have `tsx` installed globally:

```bash
npx tsx scripts/generate-seed.ts small
npx tsx scripts/generate-seed.ts large
```

### Using ts-node

```bash
npx ts-node scripts/generate-seed.ts small
npx ts-node scripts/generate-seed.ts large
```

### Output Files

The generator creates files in the `data/` directory:

- `seed_small.json` - JSON format (for API imports)
- `seed_small.sql` - SQL INSERT statements
- `seed_large.json` - JSON format (for API imports)
- `seed_large.sql` - SQL INSERT statements

## Importing into Supabase

### Method 1: SQL Import (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `data/seed_<size>.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

**Note**: The SQL file contains INSERT statements for all tables. Make sure you've run `sql/create_tables.sql` first.

### Method 2: Using psql (Command Line)

If you have `psql` installed and your Supabase connection string:

```bash
# Get your connection string from Supabase Dashboard > Settings > Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" -f data/seed_small.sql
```

### Method 3: Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
supabase db reset  # Resets and applies migrations
# Then import seed data via SQL Editor or psql
```

### Method 4: Programmatic Import (via API)

You can create a custom import script that uses the Supabase client to insert data from the JSON files. Example:

```typescript
import { createClient } from '@supabase/supabase-js'
import seedData from './data/seed_small.json'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for bulk inserts
)

// Insert advisors
await supabase.from('advisors').insert(seedData.advisors)

// Insert investors
await supabase.from('investors').insert(seedData.investors)

// Insert submissions
await supabase.from('submissions').insert(seedData.submissions)
```

## Verification

After importing, verify the data:

```sql
-- Check counts
SELECT 'advisors' as table_name, COUNT(*) as count FROM advisors
UNION ALL
SELECT 'investors', COUNT(*) FROM investors
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions;

-- Check sample data
SELECT * FROM advisors LIMIT 5;
SELECT * FROM investors LIMIT 5;
SELECT * FROM submissions LIMIT 5;
```

## Troubleshooting

### Foreign Key Errors

If you get foreign key constraint errors:

1. Ensure tables are created in order (run `sql/create_tables.sql` first)
2. Ensure advisors and investors are inserted before submissions
3. Check that UUIDs in submissions match existing investor/advisor IDs

### RLS Policy Errors

If RLS policies block inserts:

- Use the **service role key** (SUPABASE_SERVICE_ROLE_KEY) for bulk imports
- Or temporarily disable RLS during import (not recommended for production)

### Large Dataset Import

For the large dataset (10k investors):

- Use SQL import method for best performance
- Consider importing in batches if you encounter timeout issues
- Monitor Supabase dashboard for import progress

## Notes

- Seed data uses deterministic faker seeding (seed: 42) for consistent results
- All UUIDs are generated using faker, not database gen_random_uuid()
- pfhr_score is set to NULL (will be calculated in later phases)
- Email addresses are unique and generated deterministically
