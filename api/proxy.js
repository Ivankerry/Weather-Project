export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  // Strip '/api/proxy' to get the original API path
  const targetPath = url.pathname.replace('/api/proxy', '');
  const targetUrl = new URL(targetPath, 'https://api.weather-ai.co');
  targetUrl.search = url.search;

  // Clone headers and securely inject the API_KEY from Vercel Environment Variables
  const newHeaders = new Headers(req.headers);
  newHeaders.delete('host');
  newHeaders.delete('referer');
  newHeaders.set('Authorization', `Bearer ${process.env.API_KEY || ''}`);

  return fetch(targetUrl, {
    method: req.method,
    headers: newHeaders,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    duplex: 'half'
  });
}
