# 🎨 Fynly Design System — Neo-Finance Hybrid

**Version 1.0** | Complete UI/UX Specification for MVP

---

## 📋 Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Grid](#spacing--grid)
5. [Elevation & Glass Effects](#elevation--glass-effects)
6. [Iconography](#iconography)
7. [Component Library](#component-library)
8. [Motion & Animation](#motion--animation)
9. [Accessibility](#accessibility)
10. [Developer Handoff](#developer-handoff)

---

## 🎯 Design Philosophy

**Neo-Finance Hybrid** merges:
- **Professional Trust** (financial services credibility)
- **Modern Minimalism** (Gen-Z friendly, clean interfaces)
- **Glassmorphism** (subtle depth, light transparency)
- **Neumorphism** (soft shadows for tactile feel)

**Target Audience:** Working professionals, 22–35, seeking financial guidance  
**Core UX Principles:**
- **Investor flows:** ≤2 clicks from discovery to booking
- **Advisor flows:** Data-rich dashboards, professional tools
- **Trust:** Prominent SEBI verification, consent flows, transparency
- **Speed:** Fast slot selection, instant chat, minimal friction

---

## 🎨 Color System

### Primary Palette

| Token | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| **graphite-50** | `#F9FAFB` | Subtle backgrounds | `bg-graphite-50` |
| **graphite-100** | `#F3F4F6` | Card backgrounds | `bg-graphite-100` |
| **graphite-200** | `#E5E7EB` | Borders, dividers | `border-graphite-200` |
| **graphite-300** | `#D1D5DB` | Disabled states | `text-graphite-300` |
| **graphite-400** | `#9CA3AF` | Placeholder text | `text-graphite-400` |
| **graphite-500** | `#6B7280` | Secondary text | `text-graphite-500` |
| **graphite-600** | `#4B5563` | Body text | `text-graphite-600` |
| **graphite-700** | `#374151` | Headings | `text-graphite-700` |
| **graphite-800** | `#1F2937` | Primary text | `text-graphite-800` |
| **graphite-900** | `#111827` | Strong emphasis | `text-graphite-900` |

### Accent Palette (Mint/Cyan)

| Token | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| **mint-50** | `#ECFDF5` | Success backgrounds | `bg-mint-50` |
| **mint-100** | `#D1FAE5` | Hover states (light) | `bg-mint-100` |
| **mint-200** | `#A7F3D0` | Borders (accent) | `border-mint-200` |
| **mint-300** | `#6EE7B7` | Icons, badges | `text-mint-300` |
| **mint-400** | `#34D399` | Secondary CTA | `bg-mint-400` |
| **mint-500** | `#3AE2CE` | **Primary CTA** | `bg-mint-500` |
| **mint-600** | `#009FB7` | CTA hover | `bg-mint-600` |
| **mint-700** | `#047857` | Active states | `bg-mint-700` |

### Semantic Colors

| Token | Hex | Usage | Tailwind |
|-------|-----|-------|----------|
| **success** | `#10B981` | Success states | `bg-success` |
| **warning** | `#F59E0B` | Warning states | `bg-warning` |
| **error** | `#EF4444` | Error states | `bg-error` |
| **info** | `#3B82F6` | Info states | `bg-info` |

### Background System

| Token | Value | Usage |
|-------|-------|-------|
| **smoke** | `#F7F8FA` | Page background |
| **glass-white** | `rgba(255,255,255,0.6)` | Glass cards (light) |
| **glass-dark** | `rgba(255,255,255,0.8)` | Glass modals |

### Gradients

```css
/* Primary CTA Gradient */
.gradient-mint {
  background: linear-gradient(135deg, #3AE2CE 0%, #009FB7 100%);
}

/* Subtle Background */
.gradient-subtle {
  background: linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%);
}

/* Shimmer (loading states) */
.gradient-shimmer {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.8) 50%, 
    rgba(255,255,255,0) 100%);
}
```

---

## ✍️ Typography

### Font Families

**Primary (Sans):** Inter (400, 500, 600, 700)  
**Display (Headers):** Poppins (600, 700)

### Type Scale

| Token | Size | Line Height | Weight | Usage | Tailwind |
|-------|------|-------------|--------|-------|----------|
| **H1** | 48px | 1.2 | 700 | Page titles | `text-5xl font-bold` |
| **H2** | 36px | 1.3 | 600 | Section titles | `text-4xl font-semibold` |
| **H3** | 28px | 1.4 | 600 | Card titles | `text-3xl font-semibold` |
| **H4** | 24px | 1.4 | 600 | Component headers | `text-2xl font-semibold` |
| **H5** | 20px | 1.5 | 600 | Subsections | `text-xl font-semibold` |
| **Body** | 16px | 1.6 | 400 | Main content | `text-base` |
| **Body-Small** | 14px | 1.5 | 400 | Secondary text | `text-sm` |
| **Caption** | 12px | 1.4 | 400 | Labels, metadata | `text-xs` |

### Font Weights
- **Regular:** 400 (body text)
- **Medium:** 500 (emphasis)
- **Semibold:** 600 (headings, CTAs)
- **Bold:** 700 (H1, strong emphasis)

---

## 📐 Spacing & Grid

### Spacing System

| Token | Pixels | Rem | Tailwind |
|-------|--------|-----|----------|
| **xs** | 4px | 0.25rem | `space-1` |
| **sm** | 8px | 0.5rem | `space-2` |
| **md** | 16px | 1rem | `space-4` |
| **lg** | 24px | 1.5rem | `space-6` |
| **xl** | 32px | 2rem | `space-8` |
| **2xl** | 48px | 3rem | `space-12` |
| **3xl** | 64px | 4rem | `space-16` |

### Grid System

**Desktop (≥1024px):**
- Container: `max-w-7xl` (1280px)
- Columns: 12-column grid
- Gutter: 24px (`gap-6`)

**Tablet (768px - 1023px):**
- Container: `max-w-4xl` (896px)
- Columns: 8-column grid
- Gutter: 16px (`gap-4`)

**Mobile (<768px):**
- Container: `px-4` (16px horizontal padding)
- Columns: 4-column grid
- Gutter: 12px (`gap-3`)

### Border Radius

| Token | Value | Usage | Tailwind |
|-------|-------|-------|----------|
| **sm** | 8px | Input fields, badges | `rounded-lg` |
| **md** | 12px | Buttons, small cards | `rounded-xl` |
| **lg** | 16px | Cards, modals | `rounded-2xl` |
| **xl** | 20px | Large cards | `rounded-3xl` |
| **full** | 9999px | Avatars, pills | `rounded-full` |

---

## 🌓 Elevation & Glass Effects

### Shadow System (Neumorphism)

```css
/* Neomorph Soft (cards) */
.shadow-neomorph {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 
              0 1px 4px rgba(0, 0, 0, 0.04);
}

/* Neomorph Medium (hover states) */
.shadow-neomorph-lg {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 
              0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Neomorph Strong (modals) */
.shadow-neomorph-xl {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 
              0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Inner Soft (inputs) */
.shadow-inner-soft {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
}

/* Mint Glow (CTAs) */
.shadow-glow-mint {
  box-shadow: 0 4px 16px rgba(58, 226, 206, 0.25);
}

.shadow-glow-mint-lg {
  box-shadow: 0 8px 24px rgba(58, 226, 206, 0.35);
}
```

### Glassmorphism

```css
/* Glass Light (cards) */
.glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Glass Strong (modals) */
.glass-dark {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Glass Backdrop (modal overlay) */
.glass-backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
```

---

## 🎭 Iconography

**Style:** Line icons, 2px stroke  
**Base Size:** 24px  
**Sizes:** 16px (small), 20px (medium), 24px (default), 32px (large)

**Icon Library:** Heroicons v2 (outline style)

**Common Icons:**
- ✓ Checkmark (verification, success)
- 🔒 Lock (security, consent)
- 📞 Phone (call)
- 💬 Chat bubble (messaging)
- 📅 Calendar (scheduling)
- ⭐ Star (ratings)
- 👤 User (profile)
- 🔍 Search
- ⚙️ Settings
- ➡️ Arrow right (navigation)

**Color Usage:**
- Primary action icons: `text-mint-500`
- Secondary icons: `text-graphite-600`
- Disabled icons: `text-graphite-300`

---

## 🧩 Component Library

### 1. Buttons

#### Primary Button
```html
<button class="px-6 py-3 bg-gradient-mint text-white font-medium rounded-xl shadow-glow-mint hover:shadow-glow-mint-lg hover:scale-102 transition-all duration-200">
  Book Demo Call
</button>
```

**Specs:**
- Height: 48px (desktop), 44px (mobile, min touch target)
- Padding: 24px horizontal, 12px vertical
- Border radius: 12px
- Font: 16px, medium (500)
- Shadow: Mint glow on hover
- State: Scale 102% on hover

#### Secondary Button
```html
<button class="px-6 py-3 bg-transparent border-2 border-mint-500 text-mint-700 font-medium rounded-xl hover:bg-mint-50 transition-all duration-200">
  View Profile
</button>
```

#### Ghost Button
```html
<button class="px-4 py-2 text-graphite-700 hover:text-mint-600 hover:bg-mint-50/50 rounded-lg transition-all duration-200">
  Cancel
</button>
```

---

### 2. Input Fields

```html
<div class="relative">
  <label class="block text-sm font-medium text-graphite-700 mb-2">
    Email Address
  </label>
  <input 
    type="email" 
    class="w-full rounded-lg border border-graphite-200 bg-white px-4 py-3 shadow-inner-soft focus:outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 transition-all"
    placeholder="you@example.com"
  />
</div>
```

**Specs:**
- Height: 48px
- Border: 1px solid graphite-200
- Focus: mint-500 border + 2px mint ring (20% opacity)
- Inner shadow for depth

---

### 3. Advisor Card

```html
<div class="group rounded-2xl bg-white/60 backdrop-blur-lg border border-graphite-100/50 p-6 shadow-neomorph hover:shadow-glow-mint-sm hover:border-mint-300 transition-all duration-300 hover:-translate-y-1">
  <!-- Avatar & Name -->
  <div class="flex items-center gap-4 mb-4">
    <img src="avatar.jpg" alt="Advisor" class="w-16 h-16 rounded-full object-cover" />
    <div class="flex-1">
      <h3 class="font-semibold text-lg text-graphite-900">Rajesh Kumar</h3>
      <p class="text-sm text-graphite-600">Wealth Management Expert</p>
      <div class="flex items-center gap-2 mt-1">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-mint-50 text-mint-700 text-xs font-medium rounded ring-1 ring-mint-500/30">
          <svg class="w-3 h-3"><!-- checkmark --></svg>
          SEBI Verified
        </span>
      </div>
    </div>
  </div>
  
  <!-- Tags -->
  <div class="flex flex-wrap gap-2 mb-4">
    <span class="px-3 py-1 bg-graphite-100 text-graphite-700 text-xs rounded-full">Stocks</span>
    <span class="px-3 py-1 bg-graphite-100 text-graphite-700 text-xs rounded-full">Mutual Funds</span>
  </div>
  
  <!-- Rating & Experience -->
  <div class="flex items-center justify-between mb-4 pb-4 border-b border-graphite-100">
    <div class="flex items-center gap-1">
      <svg class="w-5 h-5 text-mint-500"><!-- star --></svg>
      <span class="font-semibold text-graphite-900">4.8</span>
      <span class="text-sm text-graphite-600">(127 reviews)</span>
    </div>
    <span class="text-sm text-graphite-600">12 years exp</span>
  </div>
  
  <!-- Price & CTA -->
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-graphite-600">Session Fee</p>
      <p class="font-display text-xl font-bold text-graphite-900">₹999</p>
      <p class="text-xs text-mint-600">First 10 min free</p>
    </div>
    <button class="px-5 py-2.5 bg-gradient-mint text-white text-sm font-medium rounded-lg shadow-glow-mint-sm hover:shadow-glow-mint hover:scale-102 transition-all">
      Quick Book
    </button>
  </div>
</div>
```

**Specs:**
- Width: Flexible (grid responsive)
- Padding: 24px
- Border radius: 16px
- Glassmorphism: 60% white, 12px blur
- Hover: Lift -4px, mint glow shadow
- Avatar: 64px circle
- Tags: 12px font, rounded-full pills
- CTA: 44px min height (touch target)

---

### 4. Badges

```html
<!-- SEBI Verified -->
<span class="inline-flex items-center gap-1 px-2 py-1 bg-mint-50 text-mint-700 text-xs font-medium rounded ring-1 ring-mint-500/30">
  <svg class="w-3 h-3"><!-- checkmark --></svg>
  SEBI Verified
</span>

<!-- Status: Active -->
<span class="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded ring-1 ring-success/20">
  Active
</span>

<!-- Status: Pending -->
<span class="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded ring-1 ring-warning/20">
  Pending Approval
</span>
```

---

### 5. Modal Structure

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
  <!-- Modal -->
  <div class="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-neomorph-xl max-w-lg w-full animate-scale-in">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-graphite-100">
      <h3 class="font-display text-xl font-semibold text-graphite-900">Modal Title</h3>
      <button class="rounded-full p-2 text-graphite-400 hover:bg-graphite-100 hover:text-graphite-600">
        <svg><!-- X icon --></svg>
      </button>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <!-- Content here -->
    </div>
    
    <!-- Footer (optional) -->
    <div class="flex items-center justify-end gap-3 p-6 border-t border-graphite-100">
      <button class="btn-ghost">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

---

### 6. Toast Notifications

```html
<div class="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-md border-l-4 border-mint-500 rounded-lg shadow-neomorph-lg p-4 max-w-sm animate-slide-in-right">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-mint-500 flex-shrink-0"><!-- icon --></svg>
    <div class="flex-1">
      <p class="font-semibold text-graphite-900">Success</p>
      <p class="text-sm text-graphite-600 mt-1">Booking confirmed!</p>
    </div>
    <button class="text-graphite-400 hover:text-graphite-600">
      <svg><!-- X --></svg>
    </button>
  </div>
</div>
```

---

### 7. Loading Skeleton

```html
<div class="animate-pulse space-y-4">
  <div class="h-4 bg-graphite-200 rounded w-3/4"></div>
  <div class="h-4 bg-graphite-200 rounded w-1/2"></div>
  <div class="h-8 bg-graphite-200 rounded w-full"></div>
</div>
```

---

## 🎬 Motion & Animation

### Timing Functions
- **Ease-in-out:** Default for most transitions
- **Duration:** 200ms (interactions), 300ms (layout changes)

### Keyframes (Tailwind)
```js
animation: {
  'fade-in': 'fadeIn 300ms ease-in-out',
  'slide-up': 'slideUp 300ms ease-out',
  'slide-in-right': 'slideInRight 300ms ease-out',
  'scale-in': 'scaleIn 200ms ease-out',
  'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
}
```

### Hover States
- **Buttons:** Scale 102%, shadow increase
- **Cards:** Lift -4px (translate-y), mint glow
- **Links:** Color shift to mint-600

---

## ♿ Accessibility

### Color Contrast (WCAG AA)
- Body text on white: ≥4.5:1 ✓
- Mint-500 on white: 3.8:1 (use for large text only)
- Graphite-700 on white: 7.2:1 ✓

### Focus States
- Visible focus ring: `focus:ring-2 focus:ring-mint-500 focus:ring-offset-2`
- Keyboard navigable: Tab order follows visual hierarchy

### Touch Targets
- Minimum: 44px × 44px (mobile CTAs)
- Desktop buttons: 48px height

### Screen Readers
- All icons have `aria-label`
- Form fields have associated `<label>` elements
- Modals have `role="dialog"` and `aria-modal="true"`

---

## 🛠️ Developer Handoff

### Tailwind Config Extensions

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        graphite: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        mint: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#3AE2CE',
          600: '#009FB7',
          700: '#047857',
        },
        smoke: '#F7F8FA',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      boxShadow: {
        'neomorph': '0 2px 8px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'neomorph-lg': '0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
        'neomorph-xl': '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.04)',
        'glow-mint': '0 4px 16px rgba(58,226,206,0.25)',
        'glow-mint-lg': '0 8px 24px rgba(58,226,206,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
}
```

### API Endpoints (Expected)

```typescript
// Booking
POST /api/bookings
{
  advisor_id: string
  start_time: ISO8601
  investor_id: string
  consent_recording: boolean
  consent_terms: boolean
}

// Call
GET /api/calls/{call_id}
POST /api/calls/{call_id}/join
POST /api/calls/{call_id}/end

// Payment
POST /api/payments/create
{
  advisor_id: string
  call_id: string
  amount: number
}
POST /api/payments/verify
{
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// Chat
GET /api/chats/{relationship_id}/messages
POST /api/chats/messages
{
  relationship_id: string
  message: string
  attachment?: File
}
```

---

## 📦 Deliverables Summary

✅ **Design System:** Colors, typography, spacing, shadows, glassmorphism  
✅ **Component Library:** Buttons, inputs, cards, modals, badges, toasts  
✅ **Iconography:** 24px line icons, 2px stroke  
✅ **Accessibility:** WCAG AA compliant, keyboard navigable, screen reader ready  
✅ **Motion:** Smooth transitions, hover states, loading animations  
✅ **Developer Handoff:** Tailwind config, API specs, HTML/CSS examples

---

**Ready for implementation.** Next: Build out all page-level components and flows.


