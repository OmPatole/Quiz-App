# Mobile Responsiveness Testing Guide

## Quick Test URLs

Once the dev server is running, test these pages at different screen sizes:

### Public Pages
- **Landing Page**: http://localhost:5173/
- **Features**: http://localhost:5173/features
- **About**: http://localhost:5173/about
- **Login**: http://localhost:5173/login

### Protected Pages (Login Required)
- **Admin Dashboard**: http://localhost:5173/admin
- **Student Dashboard**: http://localhost:5173/student

## Browser DevTools Testing

### Chrome DevTools
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Click the device toolbar icon (or press `Ctrl+Shift+M` / `Cmd+Shift+M`)
3. Test these preset devices:
   - **Mobile S**: 320px (Galaxy Fold)
   - **Mobile M**: 375px (iPhone SE)
   - **Mobile L**: 425px (iPhone 12 Pro)
   - **Tablet**: 768px (iPad)
   - **Desktop**: 1440px

### Testing Checklist by Component

#### ✅ Navbar (All Pages)
**Mobile (<640px)**
- [ ] Logo is visible
- [ ] Hamburger menu icon appears
- [ ] Clicking hamburger opens menu
- [ ] Menu slides down smoothly
- [ ] All links are visible and tappable
- [ ] Clicking a link closes the menu

**Desktop (>640px)**
- [ ] Full navigation visible
- [ ] No hamburger menu
- [ ] Hover effects work

#### ✅ Landing Page
**Mobile**
- [ ] Hero text is readable (no overflow)
- [ ] CTA buttons stack vertically
- [ ] Feature cards display in single column
- [ ] Cards have proper spacing (no touching)
- [ ] "Why Aptitude" cards stack properly

**Tablet**
- [ ] Bento grid shows 2-3 columns
- [ ] Large feature card spans properly

**Desktop**
- [ ] Full bento grid layout (3 columns)
- [ ] Large feature card (2x2 span)

#### ✅ Student Manager (Admin Dashboard > Students Tab)
**Mobile**
- [ ] Filter dropdowns are full-width
- [ ] Search bar is full-width
- [ ] Table scrolls horizontally without breaking layout
- [ ] All columns are visible when scrolling
- [ ] Action buttons remain accessible

**Desktop**
- [ ] Table displays full-width without scroll
- [ ] Filters display inline

#### ✅ Quiz Interface
**Mobile**
- [ ] Timer is visible and readable
- [ ] Question number shows
- [ ] Question text is minimum 16px (text-base)
- [ ] Options are easy to tap (sufficient spacing)
- [ ] Navigation buttons are sticky at bottom
- [ ] Buttons show only icons (chevrons) on very small screens
- [ ] Submit button is prominent

**Desktop**
- [ ] Question text is 18px (text-lg)
- [ ] Navigation shows full labels (Previous/Next)
- [ ] Navigation is static (not sticky)

## Screen Size Breakpoints

The app uses Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Prefix | Example    |
|------------|-----------|--------|------------|
| Mobile     | 0px       | (none) | `text-base` |
| Tablet     | 640px     | `sm:`  | `sm:text-lg` |
| Desktop    | 768px     | `md:`  | `md:text-xl` |
| Large      | 1024px    | `lg:`  | `lg:text-2xl` |
| XL         | 1280px    | `xl:`  | `xl:text-3xl` |

## Common Issues to Watch For

### ❌ Layout Issues
- Horizontal scrollbar on mobile (indicates overflow)
- Text cut off or overlapping
- Buttons too small to tap (< 44px touch target)
- Content touching screen edges (needs padding)

### ✅ Expected Behavior
- All content fits within viewport width
- Minimum 16px padding on mobile
- Touch targets minimum 44x44px
- Smooth transitions when resizing

## Testing in Real Devices

### iOS (Safari)
1. Connect iPhone to Mac
2. Enable Web Inspector in iPhone Settings > Safari > Advanced
3. In Safari on Mac: Develop > [Your iPhone] > localhost

### Android (Chrome)
1. Enable USB Debugging on Android device
2. Connect via USB
3. In Chrome: `chrome://inspect` > Find your device

## Performance Testing

Test these scenarios:
1. **Slow 3G Network**: DevTools > Network tab > Select "Slow 3G"
2. **Touch Events**: Ensure all buttons respond to touch (not just mouse)
3. **Orientation Changes**: Rotate device/emulator (Portrait ↔ Landscape)

## Accessibility Testing

Use Chrome DevTools Lighthouse:
1. Open DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select "Mobile" device
4. Check only "Accessibility"
5. Click "Generate report"

**Target Score**: 90+ for accessibility

## Quick Fixes for Common Issues

### "Content overflows on mobile"
```jsx
// Add this to parent container
className="px-4 max-w-screen overflow-x-hidden"
```

### "Table doesn't fit"
```jsx
// Already implemented in StudentManager
<div className="overflow-x-auto">
  <div className="min-w-[640px]">
    <table>...</table>
  </div>
</div>
```

### "Text too small on mobile"
```jsx
// Use responsive text sizes
className="text-sm md:text-base lg:text-lg"
```

### "Buttons too close together"
```jsx
// Use gap utilities
className="flex gap-4" // 16px gap
className="flex gap-2" // 8px gap
```

## Final Checklist

Before considering mobile responsive complete:

- [ ] Test on physical device (if available)
- [ ] Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
- [ ] Verify no horizontal scroll on any page
- [ ] Check all forms are usable
- [ ] Verify all CTAs are tappable
- [ ] Test with slow network connection
- [ ] Verify favicon appears in browser tab
- [ ] Check page title in browser tab
- [ ] Test hamburger menu open/close multiple times
- [ ] Verify sticky elements don't cover content

## Notes

- The application uses a mobile-first approach (styles apply to mobile by default, then override for larger screens)
- All spacing uses Tailwind's spacing scale (multiples of 4px: 1=4px, 2=8px, 4=16px, etc.)
- Color theme is maintained across all screen sizes (emerald + neutral dark)
