# iPad PWA Kiosk - Quick Start Guide

## What's New?

Your web application is now fully configured as an iPad kiosk-style Progressive Web App (PWA) with:

✅ **Fullscreen Standalone Mode** - App launches without any Safari UI  
✅ **Complete iOS Support** - All Apple PWA meta tags configured  
✅ **Touch Gesture Control** - Zoom, pull-to-refresh, and swipe-back disabled  
✅ **Responsive iPad Layout** - Works on all iPad sizes and orientations  
✅ **Offline Support** - Service Worker caching for offline functionality  
✅ **Password Protection** - Client-side app authentication  

---

## Files Added/Modified

### New Files Created:
- `public/pwa-kiosk-init.js` - Initialization script for fullscreen mode
- `public/pwa-kiosk.css` - Comprehensive CSS for kiosk display
- `public/browserconfig.xml` - Windows tile configuration
- `docs/PWA_KIOSK_SETUP.md` - Complete technical documentation

### Modified Files:
- `index.html` - Enhanced with Apple iOS meta tags and CSS
- `public/manifest.json` - Updated PWA manifest for iPad
- `public/service-worker.js` - Already configured (no changes needed)

---

## Installation on iPad

### Steps:
1. Open **Safari** on your iPad
2. Navigate to your app URL
3. Tap the **Share button** (box with arrow) at bottom
4. Scroll down and tap **"Add to Home Screen"**
5. Name your app and tap **"Add"**
6. Tap the new app icon to launch in fullscreen

### After Installation:
- App runs fullscreen without Safari UI
- No address bar, tabs, or browser controls visible
- Status bar shows time/battery (swipe from top)
- Cannot navigate back with left swipe
- All zoom gestures disabled

---

## Key Features

### 🔒 **Fullscreen Kiosk Mode**
- No browser UI elements visible
- Entire screen available for your app
- Behaves like a native iPad app

### 🎯 **Touch Control**
- Pinch-to-zoom disabled ✓
- Double-tap zoom disabled ✓
- Pull-to-refresh disabled ✓
- Long-press context menu disabled ✓
- Swipe-back gesture disabled ✓

### 📱 **Responsive Design**
- Auto-adjusts for all iPad sizes
- Supports landscape and portrait
- Notch/safe area support on newer iPads
- Fullscreen viewport utilization

### 🔋 **Offline Ready**
- Service Worker caches your app
- Works without internet connection
- Automatic cache updates

### 🔐 **Password Protected**
- Client-side password authentication
- Stored in localStorage for session persistence
- Default password: `P@ss1234` (changeable via environment variables)

---

## Configuration

### Change Password
1. Open `src/components/PasswordProtection.jsx`
2. Update `REQUIRED_PASSWORD` value
3. Or use environment variable: `VITE_APP_PASSWORD=your_password`

### Change Theme Color
1. Open `index.html`
2. Update `theme_color` in manifest
3. Update meta tag: `<meta name="theme-color">`
4. Regenerate app icons in your brand color

### Change App Name
1. Open `public/manifest.json`
2. Update `"name"` and `"short_name"`
3. Update `index.html` title tag
4. Update `apple-mobile-web-app-title` meta tag

---

## Testing

### Local Development:
```bash
npm run dev
```
Visit: http://localhost:5173

### Production Build:
```bash
npm run build
npm run preview
```

### On Real iPad:
1. Deploy to production (HTTPS required)
2. Open Safari on iPad
3. Add to Home Screen
4. Test all features:
   - Try to zoom (should be blocked)
   - Try to scroll up (should block pull-to-refresh)
   - Try to swipe left to go back (should be blocked)
   - Test offline mode (disable WiFi)

---

## Security Note

⚠️ **Client-side Password Protection**

The password protection is implemented on the client-side using localStorage. This is suitable for:
- ✓ Preventing accidental access
- ✓ User-friendly authentication for kiosks
- ✓ Demo/prototype environments

For production high-security applications:
- Consider server-side authentication
- Use OAuth 2.0 or similar protocols
- Implement proper session management
- Add HTTPS + Security headers

---

## Browser Requirements

| Device | Browser | Min Version | Notes |
|--------|---------|-------------|-------|
| iPad | Safari | iOS 13.2+ | Recommended iOS 15+ |
| iPhone | Safari | iOS 13.2+ | Also supported |
| Android | Chrome | 90+ | Full support |
| Desktop | Chrome | 90+ | Install prompt only |
| Desktop | Safari | 14.1+ | Limited support |

---

## Troubleshooting

### "Add to Home Screen" not appearing?
- ✓ Use Safari (not Chrome or in-app browser)
- ✓ Ensure HTTPS connection
- ✓ Check `manifest.json` is valid
- ✓ Verify iOS 13.2 or newer

### App not launching fullscreen?
- ✓ Ensure it was added via Safari's "Add to Home Screen"
- ✓ Check `display: standalone` in manifest
- ✓ Verify `apple-mobile-web-app-capable` meta tag

### Zoom still works?
- ✓ Hard refresh: Cmd+Shift+R (Mac) or Shift+F5 (Windows)
- ✓ Clear Safari cache
- ✓ Re-add app to Home Screen

### Password not working?
- ✓ Clear localStorage: DevTools → Application → Storage
- ✓ Verify password in `PasswordProtection.jsx` or env variable
- ✓ Check console for errors

---

## Next Steps

1. **Customize Icons**
   - Replace placeholder images with your brand
   - Ensure 192x192px and 512x512px versions

2. **Add Splash Screens** (Optional)
   - Create landscape/portrait splash screens
   - Place in `public/` folder
   - Reference in `manifest.json`

3. **Deploy to Production**
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or your server
   - Ensure HTTPS is enabled
   - Test on real iPad

4. **Monitor Performance**
   - Check DevTools for console errors
   - Monitor Service Worker in Application tab
   - Test offline functionality regularly

---

## Support Resources

- **Full Documentation:** See `docs/PWA_KIOSK_SETUP.md`
- **MDN PWA Guide:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Apple PWA Support:** https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- **Web.dev PWA:** https://web.dev/progressive-web-apps/

---

## Questions?

Check the detailed documentation in `docs/PWA_KIOSK_SETUP.md` for:
- Technical implementation details
- Asset requirements
- Advanced features
- Security considerations
- Browser compatibility matrix

