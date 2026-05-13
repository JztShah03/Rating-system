export function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const hasTouch = maxTouchPoints > 0 || 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches;

  const isIPad = /ipad/i.test(ua) || (/macintosh/i.test(ua) && hasTouch);
  const isAndroidTablet = /android/i.test(ua) && !/mobile/i.test(ua);
  const isTabletUA = /tablet|playbook|silk/i.test(ua) || isIPad || isAndroidTablet;

  const isMobileUA = /mobile|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua);

  const screenWidth = window.screen.width || 0;
  const screenHeight = window.screen.height || 0;
  const isLargeTouchDevice = hasTouch && Math.min(screenWidth, screenHeight) >= 720;

  if (isTabletUA || isLargeTouchDevice) return 'tablet';
  if (isMobileUA) return 'mobile';
  return 'desktop';
}

export function getUserAgent() {
  return navigator.userAgent || 'Unknown';
}
