export function getDeviceType() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  const isTabletUA = /tablet|ipad|playbook|silk/i.test(ua);
  const isMobileUA = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua);

  // iPadOS 13+ may report as Macintosh; use touch-capable desktop-class device detection
  const isIPadOS = /Macintosh/i.test(ua) && maxTouchPoints > 1;
  const isTouchTablet = isTabletUA || isIPadOS || (maxTouchPoints > 1 && /MacIntel|Linux armv8l|Linux aarch64/i.test(platform));

  if (isTabletUA || isIPadOS || isTouchTablet) return 'tablet';
  if (isMobileUA) return 'mobile';
  return 'desktop';
}

export function getUserAgent() {
  return navigator.userAgent || 'Unknown';
}
