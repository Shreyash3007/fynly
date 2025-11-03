# Demo Setup Instructions

Quick setup guide for the Fynly Demo application.

## One-Liner Setup

```bash
cd demo && npm install && npm run seed && npm run dev
```

## Step-by-Step

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Mock Data**
   ```bash
   npm run seed
   ```
   This creates:
   - 50 advisors in `data/seed/advisors.json`
   - 200 investors in `data/seed/investors.json`
   - Bookings, news, and success stories

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Visit `http://localhost:3001`

## Demo Users

The app automatically creates two mock users:

- **Investor**: Select "Investor" on home page
- **Advisor**: Select "Advisor" on home page

User sessions persist in localStorage.

## Troubleshooting

**Port 3001 already in use?**
- Change port in `package.json`: `"dev": "next dev -p 3002"`

**Data not loading?**
- Ensure `npm run seed` completed successfully
- Check `data/seed/` directory exists with JSON files

**Build errors?**
- Run `npm run type-check` to see TypeScript errors
- Run `npm run lint` to see linting issues

## Next Steps

- Explore the discover page
- Book a demo session
- View the investor dashboard
- Join a simulated video call

---

For full documentation, see [README.md](./README.md)

