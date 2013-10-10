var http = require('http');
var fs = require('fs');

function handleIncomingRequest(req, res) {
  console.log("INCOMING REQUEST for load albums:  " + req.method + ' ' + req.url);

  loadAlbumList(function(err, albums){
    if (err) {
      res.writeHead(503, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: null}) + "\n");
    }
    else {
      var out = {
        error: null,
        data: {albums: albums}
      };
      res.writeHead(200, {'Content-Type' : 'application/json'});
      res.end(JSON.stringify(out) + "\n");
    }
  });
  }

function loadAlbumList(callback) {
  fs.readdir('albums', function(err, files) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, files);
    }
  });
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);