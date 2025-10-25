# ⚡ Fynly Quick Start Guide

**Get your Neo-Finance Hybrid design system running in 5 minutes!**

---

## 🚀 Quick Setup

### **1. Install Dependencies**
```bash
npm install
```

### **2. Set Environment Variables**
Create `.env.local` file:
```env
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Start Development Server**
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 📱 What You'll See

### **Homepage** (`/`)
- Modern hero with mint gradient text
- Trust signals (SEBI, secure, ratings)
- Glassmorphism feature cards
- Professional navigation bar
- Clean footer

### **Components Showcase**
All components are ready to use:

```tsx
import { Button, Card, Badge, Modal, Toast } from '@/components/ui'

// Mint gradient button
<Button variant="primary" size="lg">
  Find Your Advisor
</Button>

// Glassmorphism card
<Card glass hover glow>
  <CardTitle>Your Title</CardTitle>
  <CardContent>Your content</CardContent>
</Card>

// Verified badge
<VerifiedBadge>SEBI Verified</VerifiedBadge>
```

---

## 🎨 Using the Design System

### **Colors**
```tsx
// Tailwind classes available:
className="bg-graphite-900 text-white"
className="bg-mint-500 text-white"
className="bg-smoke"
className="text-gradient-mint" // Gradient text
```

### **Effects**
```tsx
// Glassmorphism
className="bg-white/80 backdrop-blur-md"

// Neumorphic shadow
className="shadow-neomorph"

// Mint glow
className="shadow-glow-mint hover:shadow-glow-mint-lg"
```

### **Buttons**
```tsx
// Primary (mint gradient)
<Button variant="primary">Click Me</Button>

// Secondary (mint outline)
<Button variant="secondary">Learn More</Button>

// Ghost (text only)
<Button variant="ghost">Cancel</Button>
```

### **Cards**
```tsx
// Standard card
<Card>Content</Card>

// With glassmorphism
<Card glass>Content</Card>

// With hover effect
<Card hover>Content</Card>

// With mint glow on hover
<Card glow>Content</Card>
```

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Format code
npm run format

# Run tests
npm test
```

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (investor)/        # Investor routes
│   ├── (advisor)/         # Advisor routes
│   ├── (admin)/           # Admin routes
│   ├── api/               # API routes
│   ├── page.tsx           # Homepage ⭐
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Error boundary
│   └── not-found.tsx      # 404 page
├── components/
│   ├── ui/                # UI components ⭐
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Toast.tsx
│   │   └── Loading.tsx
│   └── layout/            # Layout components ⭐
│       └── Navbar.tsx
├── styles/
│   └── globals.css        # Global styles + utilities ⭐
├── lib/                   # Utilities & integrations
└── types/                 # TypeScript types
```

---

## 🎯 Key Files to Know

### **Design System Core**
- `tailwind.config.ts` - Color tokens, shadows, animations
- `src/styles/globals.css` - Utility classes, effects
- `src/components/ui/` - Reusable components

### **Pages**
- `src/app/page.tsx` - Homepage
- `src/app/(investor)/dashboard/page.tsx` - Investor dashboard
- `src/app/(advisor)/advisor/dashboard/page.tsx` - Advisor dashboard

### **Layout**
- `src/app/layout.tsx` - Root layout with fonts
- `src/components/layout/Navbar.tsx` - Navigation

---

## 🎨 Customization Guide

### **Change Primary Color**
Edit `tailwind.config.ts`:
```ts
colors: {
  mint: {
    500: '#YOUR_COLOR', // Change mint accent
  }
}
```

### **Change Fonts**
Edit `src/app/layout.tsx`:
```ts
import { Inter, YourFont } from 'next/font/google'
```

### **Add New Component**
1. Create in `src/components/ui/YourComponent.tsx`
2. Export from `src/components/ui/index.ts`
3. Use throughout app

---

## 🐛 Troubleshooting

### **Build Errors**

**Missing Tailwind plugins:**
```bash
npm install @tailwindcss/forms @tailwindcss/typography
```

**TypeScript errors:**
```bash
npm run type-check
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

### **Common Issues**

**Port 3000 in use:**
```bash
# Server will automatically use port 3001
# Or kill the process using port 3000
```

**Environment variables not loading:**
- Restart dev server after changing `.env.local`
- Check variable names start with `NEXT_PUBLIC_` for client-side

**Styles not applying:**
- Check Tailwind classes are spelled correctly
- Ensure file is in `content` array in `tailwind.config.ts`
- Clear browser cache

---

## 📚 Learn More

### **Documentation**
- `DESIGN_SYSTEM_IMPLEMENTATION.md` - Full design system docs
- `LAUNCH_READY.md` - Production checklist
- Component comments - In-code documentation

### **External Resources**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 💡 Pro Tips

### **Performance**
- Images: Use `next/image` component
- Fonts: Already optimized with `font-display: swap`
- Code: Automatic code splitting with App Router

### **Accessibility**
- All components have WCAG AA contrast
- Keyboard navigation built-in
- Screen reader friendly

### **Development**
- Use TypeScript types for better DX
- Component props are fully typed
- ESLint configured for code quality

---

## 🎉 You're All Set!

Your Fynly Neo-Finance Hybrid design system is ready to use!

**What's Next:**
1. Explore the homepage at `http://localhost:3000`
2. Check out components in `src/components/ui/`
3. Build your features using the design system
4. Deploy to production (see `LAUNCH_READY.md`)

**Need Help?**
- Check `DESIGN_SYSTEM_IMPLEMENTATION.md` for detailed docs
- Review component code for usage examples
- Test in browser DevTools

---

**Happy Building! 🚀**

Version 1.0.0 | Neo-Finance Hybrid Design System

