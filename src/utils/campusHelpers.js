const IPIFY_URL = 'https://api.ipify.org?format=json';

const BRANCH_IP_MAP = {
  '121.120.98.130': 'EP',
  '121.120.81.3': 'JB'
};

export function mapIpToBranch(ip) {
  const cleanIp = String(ip || '').trim();
  return BRANCH_IP_MAP[cleanIp] || 'Unknown';
}

export async function getBranchByIp() {
  try {
    const response = await fetch(IPIFY_URL, { cache: 'no-store' });

    if (!response.ok) {
      return 'Unknown';
    }

    const data = await response.json();
    return mapIpToBranch(data.ip);
  } catch (error) {
    console.warn('Branch IP lookup failed:', error);
    return 'Unknown';
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
