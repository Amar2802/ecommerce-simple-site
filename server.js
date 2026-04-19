const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 5173;
const root = process.cwd();
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

http
  .createServer((request, response) => {
    let pathname = decodeURIComponent(request.url.split('?')[0]);
    if (pathname === '/') pathname = '/index.html';

    const file = path.normalize(path.join(root, pathname));
    if (!file.startsWith(root)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    fs.readFile(file, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'text/plain',
      });
      response.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`FashionWorld running at http://127.0.0.1:${port}`);
  });
