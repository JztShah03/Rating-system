const IPIFY_URL = 'https://api.ipify.org?format=json';

const CAMPUS_IP_MAP = {
  '121.120.98.130': 'EP Campus',
  '121.120.81.3': 'JB Campus'
};

export function mapIpToCampus(ip) {
  const cleanIp = String(ip || '').trim();
  return CAMPUS_IP_MAP[cleanIp] || 'Unknown';
}

export async function getCampus() {
  try {
    const response = await fetch(IPIFY_URL, { cache: 'no-store' });

    if (!response.ok) {
      return { campus: 'Unknown', rawIp: '' };
    }

    const data = await response.json();
    const rawIp = String(data.ip || '').trim();
    return { campus: mapIpToCampus(rawIp), rawIp };
  } catch (error) {
    console.error('IP Detection Failed:', error);
    return { campus: 'Unknown', rawIp: '' };
  }
}
