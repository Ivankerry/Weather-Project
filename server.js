const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  let filePath = '.' + req.url.split('?')[0];
  if (filePath === './') filePath = './index.html';
  // Local development proxy to simulate Vercel's /api/proxy serverless function
  if (req.url.startsWith('/api/proxy')) {
    let envContent = '';
    try { envContent = fs.readFileSync('.env', 'utf8'); } catch (e) { }
    const match = envContent.match(/API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : '';

    const targetPath = req.url.replace('/api/proxy', '');
    const options = {
      hostname: 'api.weather-ai.co',
      port: 443,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: 'api.weather-ai.co',
        'Authorization': `Bearer ${apiKey}`
      }
    };

    // Pipe the request transparently
    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxyReq.on('error', (e) => {
      res.writeHead(500);
      res.end(`Proxy Error: ${e.message}`);
    });
    req.pipe(proxyReq, { end: true });
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});
