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
      // Only return entires that are folders, not files.
      var only_dirs = [];

      // Create a anonymoys recursive function that runs until all files from
      // this directly have been processed, then execute the callback.
      (function iterator(index) {
        if (index == files.length) {
          callback(null, only_dirs);
          return;
        }
        else {
          var entry = 'albums/' + files[index];
          fs.stat(entry, function(err, stats) {
            if (err) {
              callback(err);
            }
            else {
              if (stats.isDirectory()) {
                only_dirs.push(files[index]);
              }
              // Increase the iterator and trigger the recursion.
              iterator(index + 1);
            }
          })
        }
      })(0);

    }
  });
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);