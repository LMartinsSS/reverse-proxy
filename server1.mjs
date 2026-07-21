import http from 'node:http';

const PORT = 3001;

const server = http.createServer((req, res) => {
  console.log(`Server 1 received: ${req.method} ${req.url}`);

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
  });

  res.end(
    JSON.stringify({
      message: 'Response from server 1',
      method: req.method,
      path: req.url,
    }),
  );
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server 1 running at http://127.0.0.1:${PORT}`);
});