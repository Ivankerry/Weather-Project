const http = require('http');
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
  if (req.url === '/js/config.js') {
    let envContent = '';
    try { envContent = fs.readFileSync('.env', 'utf8'); } catch(e){}
    const match = envContent.match(/API_KEY=(.*)/);
    const apiKey = match ? match[1].trim() : 'YOUR_API_KEY_HERE';
    
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`export const API_BASE_URL = 'https://api.weather-ai.co';\nexport const API_KEY = '${apiKey}';`);
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
