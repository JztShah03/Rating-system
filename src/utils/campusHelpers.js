const IPIFY_URL = 'https://api.ipify.org?format=json';

const CAMPUS_IP_MAP = {
  '121.120.81.3': 'EP Campus',
  '121.120.98.130': 'JB Campus'
};

export function mapIpToCampus(ip) {
  const cleanIp = String(ip || '').trim();
  return CAMPUS_IP_MAP[cleanIp] || '';
}

export async function getCampusByIp() {
  try {
    const response = await fetch(IPIFY_URL, { cache: 'no-store' });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    return mapIpToCampus(data.ip);
  } catch (error) {
    console.warn('Campus IP lookup failed:', error);
    return '';
  }
}

export async function getPublicIp() {
  try {
    const response = await fetch(IPIFY_URL, { cache: 'no-store' });
    if (!response.ok) return '';
    const data = await response.json();
    return String(data.ip || '').trim();
  } catch (error) {
    console.warn('IP lookup failed:', error);
    return '';
  }
}
