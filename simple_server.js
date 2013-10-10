var http = require('http');

function handleIncomingRequest(req, res) {
  console.log("INCOMING REQUEST:  " + req.method + ' ' + req.url);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({error: null}) + "\n");
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);

