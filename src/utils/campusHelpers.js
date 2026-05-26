const IP_SERVICES = [
  { url: 'https://api.ipify.org?format=json', extract: (data) => data.ip },
  { url: 'https://api64.ipify.org?format=json', extract: (data) => data.ip },
  { url: 'https://api.my-ip.io/v1/ip.json', extract: (data) => data.ip },
];

const CAMPUS_IP_MAP = {
  '121.120.98.130': 'EP Campus',
  '121.120.81.3': 'JB Campus',
};

export function mapIpToCampus(ip) {
  const cleanIp = String(ip || '').trim();
  return CAMPUS_IP_MAP[cleanIp] || 'Unknown';
}

async function fetchIpWithTimeout(service, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(service.url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) return null;
    const data = await response.json();
    return String(service.extract(data) || '').trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCampus() {
  for (const service of IP_SERVICES) {
    const rawIp = await fetchIpWithTimeout(service);
    if (rawIp) {
      return { campus: mapIpToCampus(rawIp), rawIp };
    }
  }
  console.error('IP Detection Failed: all services unreachable');
  return { campus: 'Unknown', rawIp: '' };
}
