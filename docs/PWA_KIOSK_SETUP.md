# iPad Kiosk PWA Setup Guide

## Overview
This is a complete Progressive Web App (PWA) configured for fullscreen standalone mode on iPad, behaving like a native kiosk application with no visible browser UI.

## Features Implemented

### 1. **Fullscreen Standalone Mode**
- App launches without Safari address bar, tabs, or bottom UI
- Runs in native-app-like environment
- `display: standalone` in manifest.json

### 2. **iOS/iPad Support**
- All Apple PWA meta tags configured
- iOS 13.2+ support for Add to Home Screen
- Safe area insets for notched iPads
- Status bar styling (translucent black)
- Splash screen support

### 3. **Touch & Gesture Prevention**
- ✓ Zoom disabled (no pinch-to-zoom)
- ✓ Double-tap zoom disabled
- ✓ Pull-to-refresh disabled
- ✓ Swipe-back gesture prevented
- ✓ Context menu disabled (long-press)
- ✓ Viewport locked

### 4. **Responsive iPad Layout**
- Optimized for iPad portrait and landscape
- Support for all iPad sizes (9.7", 10.5", 11", 12.9" models)
- Safe area compensation for notched iPads
- Fullscreen viewport utilization

### 5. **Offline Support**
- Service Worker caching strategy
- Works offline after initial load
- Background sync ready

### 6. **Device Optimization**
- Prevents unwanted scrolling
- Hides address bar on load
- Optimizes for touch interaction
- No default iOS zoom on input focus

---

## How to Add to iPad Home Screen

### Steps:
1. **Open Safari** on iPad
2. **Navigate to your app URL** (e.g., https://your-domain.com)
3. **Tap the Share button** (square with arrow at bottom)
4. **Scroll and tap "Add to Home Screen"**
5. **Enter a name** for the app (or keep default)
6. **Tap "Add"**
7. **Home Screen icon appears** → Tap to launch in fullscreen

### After Installation:
- App runs in standalone mode
- No Safari UI visible
- All gestures are controlled by the app
- Swipe from top edge to see time/battery
- Cannot navigate back with swipe

---

## Configuration Files

### 1. **index.html**
- Enhanced with Apple iOS meta tags
- Safe area inset variables
- Fullscreen CSS initialization
- Viewport optimization for iPad

**Key meta tags:**
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### 2. **manifest.json**
- PWA manifest configured for standalone mode
- Multiple icon sizes (192x192, 512x512)
- Maskable icons for modern iOS
- Start URL with query parameters
- Screenshot definitions for install prompts

**Display modes supported:**
- `display: standalone` - No browser UI
- `scope: /` - App controls entire domain
- `orientation: portrait-primary` - Default portrait lock

### 3. **pwa-kiosk-init.js**
Initialization script that:
- Registers Service Worker
- Prevents zooming and double-tap
- Disables pull-to-refresh
- Handles orientation changes
- Requests fullscreen API (when available)
- Prevents back swipe gestures
- Hides address bar
- Detects standalone mode

### 4. **pwa-kiosk.css**
Comprehensive CSS for:
- Fixed fullscreen layout
- Safe area inset compensation
- Touch event prevention
- iPad-specific media queries
- Reduced motion support
- High contrast support

### 5. **service-worker.js**
- Caches app assets
- Provides offline fallback
- Updates cache automatically
- Network-first strategy for fresh data

### 6. **browserconfig.xml**
- Windows/Microsoft tile configuration
- Theme color matching

---

## Technical Implementation Details

### Viewport Configuration
```html
width=device-width        <!-- Use device width -->
initial-scale=1.0         <!-- No scaling on load -->
maximum-scale=1.0         <!-- Prevent zoom -->
user-scalable=no          <!-- Disable user zoom -->
viewport-fit=cover        <!-- Use full screen including notch -->
minimal-ui                <!-- Hide UI elements (Safari) -->
```

### Safe Area Insets (for Notched iPads)
```css
--sat: env(safe-area-inset-top);      /* Top (notch) -->
--sal: env(safe-area-inset-left);     /* Left (device edge) -->
--sar: env(safe-area-inset-right);    /* Right (device edge) -->
--sab: env(safe-area-inset-bottom);   /* Bottom (home indicator) -->
```

### Touch Gesture Prevention
```javascript
// Double-tap zoom prevention
// Pinch zoom prevention
// Pull-to-refresh prevention
// Swipe-back gesture prevention
// Context menu long-press prevention
```

### Service Worker Caching
```javascript
// Install: Cache app assets
// Activate: Clean old caches
// Fetch: Serve from cache first, update in background
```

---

## Asset Requirements

For best appearance, create these images:

### App Icons (Place in `/public/`)
- `apple-touch-icon.png` - 180x180px (iOS)
- `apple-touch-icon-167.png` - 167x167px (iPad Pro 10.5")
- `apple-touch-icon-180.png` - 180x180px (Modern iPhone)
- `technician1.png` - 192x192px & 512x512px (Android/Web)
- `mstile-150x150.png` - 150x150px (Windows)
- `favicon-32x32.png` - 32x32px
- `favicon-16x16.png` - 16x16px

### Splash Screens (Optional, Place in `/public/`)
- `splash-1024x768.png` - iPad landscape (2x)
- `splash-768x1024.png` - iPad portrait (2x)

---

## Testing the PWA

### 1. **Local Testing**
```bash
npm run build
npm run preview
```
Then navigate to the local URL in Safari on iPad

### 2. **Chrome DevTools (Desktop)**
- Open DevTools → Application tab
- Check Manifest section
- Test Service Worker offline

### 3. **Real iPad Testing**
1. Deploy to production/staging
2. Open in Safari on iPad
3. Use "Add to Home Screen"
4. Test all gestures are disabled
5. Verify fullscreen display
6. Test offline functionality (enable offline mode in DevTools)

---

## Debugging Tips

### Check Installation
```javascript
// In browser console:
if (window.navigator.standalone === true) {
  console.log('✓ Running in standalone mode');
} else {
  console.log('✗ Running in browser');
}
```

### Monitor Service Worker
- Open Settings → Privacy → Safari on iPad
- Check Service Worker status
- View cache storage

### View Console
- Standalone mode: Connect via Xcode on Mac
- Or use `about:debug` in Safari on iPad (iOS 15+)

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Safari (iPad) | ✓ Full | iOS 13.2+ recommended |
| Safari (iPhone) | ✓ Full | iOS 13.2+ recommended |
| Chrome (Android) | ✓ Full | All modern versions |
| Chrome (Desktop) | ✓ Partial | Install prompt only |
| Firefox (Mobile) | ✓ Partial | Limited PWA support |

---

## Production Deployment

### Vercel / Similar CDN
1. Ensure HTTPS enabled (required for PWA)
2. Verify manifest.json is served with correct MIME type
3. Check Service Worker registration in console
4. Enable offline page caching

### Environment Variables
```
VITE_APP_PASSWORD=your_password_here
```

### Build Command
```bash
npm run build
```

Output goes to `/dist/` directory

---

## Advanced Features

### 1. **Shortcuts (iOS 13.2+)**
Users can long-press app icon to access shortcuts:
- "Rate Service" - Opens rating page
- "Admin Dashboard" - Opens admin section

### 2. **Share Target**
App can receive shared content via share sheet (set up in manifest)

### 3. **Install Prompt**
Custom install prompt can be shown programmatically

### 4. **Background Sync**
Service Worker can sync data in background (advanced)

---

## Security Considerations

1. **HTTPS Required** - PWA only works on secure connections
2. **Content Security Policy** - Configure CSP headers if needed
3. **Password Protection** - Client-side only, refresh browser to bypass
4. **Service Worker Scope** - Limit to necessary paths

---

## Troubleshooting

### Issue: "Add to Home Screen" not appearing
- ✓ Ensure HTTPS
- ✓ Check manifest.json is valid JSON
- ✓ Verify meta tags in HTML head
- ✓ Use Safari 13.1+ on iOS 13.2+

### Issue: App not launching fullscreen
- ✓ Verify `display: standalone` in manifest
- ✓ Check `apple-mobile-web-app-capable` meta tag
- ✓ Try adding from Safari (not in-app browser)

### Issue: Zoom still possible
- ✓ Check `user-scalable=no` in viewport
- ✓ Verify `maximum-scale=1.0` is set
- ✓ Ensure CSS `user-select: none` applied

### Issue: Service Worker not registering
- ✓ Check console for errors
- ✓ Verify SW file location: `/public/service-worker.js`
- ✓ Ensure site is HTTPS
- ✓ Check browser compatibility

### Issue: Offline not working
- ✓ Hard refresh (Cmd+Shift+R on Mac)
- ✓ Check DevTools → Application → Cache Storage
- ✓ Verify Service Worker is active and running

---

## References

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Apple - Configuring Web Applications](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Web.dev - PWA Checklist](https://web.dev/pwa-checklist/)
- [Web Manifest Spec](https://www.w3.org/TR/appmanifest/)

---

## Support & Updates

For issues or feature requests, check:
1. Browser console for errors
2. Service Worker status in DevTools
3. Network tab for failed requests
4. Cache Storage for offline assets

