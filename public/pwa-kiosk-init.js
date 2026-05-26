/**
 * PWA Kiosk Mode Initialization
 * Enables fullscreen standalone mode for iPad and prevents unwanted gestures
 */

(function initPWAKiosk() {
  'use strict';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('✓ Service Worker registered:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every 60 seconds
      })
      .catch((error) => {
        console.warn('✗ Service Worker registration failed:', error);
      });
  }

  // 2. Prevent Zooming and Double-Tap
  document.addEventListener('touchstart', (e) => {
    // Allow text selection in input fields
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }
  });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    // Prevent double-tap zoom
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  });

  // 3. Prevent Pull-to-Refresh (iOS Safari)
  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
      return;
    }

    // Get the element that was touched
    let target = e.target;

    // Allow scrolling only for elements that need it
    while (target && target !== document.body) {
      const overflowY = window.getComputedStyle(target).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return; // Allow scrolling for scrollable elements
      }
      target = target.parentElement;
    }

    // Prevent default pull-to-refresh on non-scrollable areas
    if (e.touches.length === 1 && document.documentElement.scrollTop === 0) {
      // Allow some scroll, but prevent excessive pull-to-refresh
      if (e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // 4. Prevent Viewport Zoom
  function preventViewportZoom(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }

  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });

  // 5. Detect if app is running in standalone mode
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) {
    console.log('✓ App running in standalone mode');
    document.documentElement.setAttribute('data-standalone', 'true');
  }

  // 6. Prevent statusbar scrolling on iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Lock body scroll
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';

    // Compensate for notch/safe area on newer iPads
    const doc = document.documentElement;
    doc.style.setProperty('--sat', 'env(safe-area-inset-top)');
    doc.style.setProperty('--sal', 'env(safe-area-inset-left)');
    doc.style.setProperty('--sar', 'env(safe-area-inset-right)');
    doc.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
  }

  // 7. Orientation Lock (if available)
  if (screen.orientation && screen.orientation.lock) {
    // Try to lock to portrait, fallback gracefully
    screen.orientation
      .lock('portrait-primary')
      .catch((error) => {
        console.info('Orientation lock not available:', error.message);
      });
  }

  // 8. Prevent context menu (long press)
  document.addEventListener('contextmenu', (e) => {
    // Allow context menu only on text inputs
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA'
    ) {
      return;
    }
    e.preventDefault();
  });

  // 9. Full Screen API Support
  function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.info('Fullscreen request failed:', err);
      });
    }
  }

  // Request fullscreen on user gesture
  document.addEventListener('click', () => {
    if (!document.fullscreenElement && isStandalone) {
      requestFullscreen();
    }
  });

  // 10. Prevent accidental navigate back with swipe
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;

    // Prevent iOS Safari back gesture (swipe from left edge)
    if (Math.abs(swipeDistance) > 100 && touchStartX < 30) {
      e.preventDefault();
    }
  });

  // 11. Hide address bar on iOS
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
  });

  // 12. Handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      document.documentElement.style.height = window.innerHeight + 'px';
    }, 100);
  });

  // 13. Prevent unintended navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && !link.hasAttribute('data-allow-navigation')) {
      // Check if it's an external link
      const href = link.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes(window.location.host)) {
        e.preventDefault();
        console.info('External navigation prevented:', href);
      }
    }
  });

  // 14. Log app info
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 PWA Kiosk Mode Active');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✓ Touch interactions locked');
  console.log('✓ Zoom disabled');
  console.log('✓ Pull-to-refresh disabled');
  console.log('✓ Fullscreen mode enabled');
  console.log('✓ Viewport optimized for iPad');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();
