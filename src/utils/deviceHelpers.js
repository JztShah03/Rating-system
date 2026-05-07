export function getDeviceType() {
  const userAgent = navigator.userAgent || '';
  const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent);
  const isMobile = /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent);

  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}

export function getUserAgent() {
  return navigator.userAgent || 'Unknown';
}
