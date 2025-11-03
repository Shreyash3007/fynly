# Deployment Guide

## Vercel Deployment

This demo is configured for automatic deployment on Vercel via GitHub.

### Automatic Deployment

1. **Push to GitHub**: Once pushed to the `main` branch, Vercel will automatically deploy
2. **Build Settings** (already configured):
   - Framework: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install && npm run seed`
   - Output Directory: `.next`

### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd demo
   vercel
   ```

3. For production:
   ```bash
   vercel --prod
   ```

### Environment Variables

No environment variables required for the demo (all data is mocked).

### Post-Deployment

1. The `npm run seed` command runs during install to generate mock data
2. All data is stored in `data/seed/*.json` files (included in repo)
3. The app runs on port 3001 in development, Vercel handles ports automatically

### Troubleshooting

- **Build fails**: Ensure `data/seed/` directory exists with JSON files
- **404 errors**: Check that `npm run seed` completed successfully
- **Type errors**: Run `npm run type-check` locally before deploying

