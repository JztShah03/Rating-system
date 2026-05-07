const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function assertScriptUrl() {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error(
      'Missing VITE_GOOGLE_SCRIPT_URL. Add it to .env locally and to Vercel environment variables.'
    );
  }
}

function createJsonpCallbackName() {
  return `__ratingsJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function saveRating(ratingPayload) {
  assertScriptUrl();

  await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action: 'saveRating',
      ...ratingPayload
    })
  });

  return {
    success: true,
    message: 'Rating request sent to Google Apps Script.'
  };
}

export function fetchRatings() {
  assertScriptUrl();

  return new Promise((resolve, reject) => {
    const callbackName = createJsonpCallbackName();
    const script = document.createElement('script');

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          'Google Apps Script request timed out. Check deployment URL and access permission.'
        )
      );
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);

      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = (data) => {
      cleanup();

      if (!data || !data.success) {
        reject(new Error(data?.message || 'Unable to load ratings.'));
        return;
      }

      resolve(data.ratings || []);
    };

    const url = new URL(GOOGLE_SCRIPT_URL);
    url.searchParams.set('action', 'ratings');
    url.searchParams.set('callback', callbackName);
    url.searchParams.set('cacheBust', String(Date.now()));

    script.src = url.toString();
    script.async = true;

    script.onerror = () => {
      cleanup();
      reject(
        new Error(
          'Unable to load Google Apps Script data. Check the Web App URL and deployment permission.'
        )
      );
    };

    document.body.appendChild(script);
  });
}