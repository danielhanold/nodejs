/**
* @file
*
* Writing a litte web server that serves up static content,
* in the form of an HTML file, using Node buffers.
*/

var http = require('http');
var fs = require('fs');


/**
* Handle incoming requests in the format of '/content/something'
*/
function handleIncomingRequest(req, res) {
  if (req.method.toLowerCase() == 'get' && req.url.substring(0, 9) == '/content/') {
    serverStaticFile(req.url.substring(9), res);
  }
  else {
    res.writeHead(404, {"Content-Type" : "application/json"});
    var out = {
      error: "not_found",
      message: "'" + req.url + "' not found"
    }
    res.end(JSON.stringify(out) + "\n");
  }
}


/**
* Server a static file.
*
* @param file
*   File name that should be loaded.
* @param res
*   Server response object.
*/
function serverStaticFile(file, res) {
  console.log('Look for file: ' + file);
  // Read in the contents of the file.
  var rs = fs.createReadStream(file);

  // Determine the type of the file and write it to the ServerResponse header.
  var ct = contentTypeForPath(file);
  res.writeHead(200, {"Content-Type": ct});

  // When content is being read, write it to the ServerResponse object.
  rs.on('readable', function() {
    var d = rs.read();
    if (d) {
      if (typeof d == 'string') {
        res.write(d);
      }
      else if (typeof d == 'object' && d instanceof Buffer) {
        res.write(d.toString('utf8'));
      }
    }
  });

  // When all content was read, end the ServerResponse response.
  rs.on('end', function() {
    res.end();
  });
}


/**
* Determine the content type for a path.
*/
function contentTypeForPath(file) {
  return 'text/html';
}


// Create a new web server object.
var s = http.createServer(handleIncomingRequest);
s.listen(8080);
