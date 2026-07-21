import http from 'node:http';

const PORT = 8080;
const HOST = '127.0.0.1';

const routes = [
    { path: '/api/server1', ports: [3001, 3002], hostname: HOST, currentPortIndex: 0 },
    { path: '/api/server2', ports: [3003, 3004], hostname: HOST, currentPortIndex: 0 }
];

function findRoute(url = '/') {
  return routes.find(route => url.startsWith(route.path));
}

function selectUpstream(route) {
  const port = route.ports[route.currentPortIndex];

  route.currentPortIndex =
    (route.currentPortIndex + 1) % route.ports.length;

  return {
    hostname: route.hostname,
    port,
  };
}

const server = http.createServer((req, res) => {

    console.log(`Received request: ${req.method} ${req.url}`);

    const route = findRoute(req.url);
    
    if(!route) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }

    const upstream = selectUpstream(route);
    
    const upstreamRequest = http.request(
        {
            hostname: upstream.hostname,
            port: upstream.port,
            path: req.url,
            method: req.method,
            headers: req.headers
        },
        upstreamResponse  => {
            res.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
            upstreamResponse.pipe(res);
        }
    );

    upstreamRequest.on('error', error => {
        console.error(`Error occurred while proxying request: ${error.message}`);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Gateway' }));
    });

    req.pipe(upstreamRequest);
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});