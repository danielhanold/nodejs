// Require web server and file system modules.
var http = require('http');
var fs = require('fs');
var url = require('url');

/**
* Load a list of albums, which contains any directory
* in the "albums" directory.
*/
function loadAlbumList(callback) {
  fs.readdir('albums', function(err, files) {
    // Error Handling.
    if (err) {
      callback(makeError('file_error', JSON.stringify(err)));
      return;
    }

    // Only return directories. Use recursive function to ensure
    // calback does not get called to early.
    var onlyDirectories = [];
    (function iterator(index) {
      // Return once all directories are processed.
      if (index == files.length) {
        callback(null, onlyDirectories);
        return;
      }

      var path = 'albums/' + files[index];
      fs.stat(path, function(err, stats) {
        if (err) {
          // Error handling in case this is not a valid path.
          callback(makeError('file_error', JSON.stringify(err)));
          return;
        }

        // Check if this path is a directory.
        if (stats.isDirectory()) {
          var obj = {name: files[index]};
          onlyDirectories.push(obj);
        }

        // Trigger another iteration.
        iterator(index + 1);
      });
    })(0);
  });
}


/**
* Load the files within an album.
*/
function loadAlbum(_params, callback) {
  _params = _params || {};

  var path = 'albums/' + _params.albumName;

  // Load all files in this directory.
  fs.readdir(path, function(err, files) {
    // Error Handling.
    if (err) {
      if (err.code == 'ENOENT') {
        callback(noSuchAlbum());
      }
      else {
        callback(makeError('file_error', JSON.stringify(err)));
      }
      return;
    }

    // Only return files, not directories. Use recursive function
    // to ensure callback gets called at the right moment.
    var onlyFiles = [];
    var path = 'albums' + _params.albumName + '/';

    (function iterator(index) {
      // Once all files are processed, execute callback.
      if (index == files.length) {
        // Slice fails gracefully if params are out of range.
        var ps = onlyFiles.splice(_params.pageNum * _params.pageSize, _params.pageSize);
        var obj = {
          short_name: _params.albumName,
          photos: ps
        };
        callback(null, obj);
        return;
      }

      var filename = path + files[index];
      fs.stat(filename, function(err, stats) {
        if (err) {
          callback(makeError('file_error', JSON.stringify(err)));
          return;
        }

        if (stats.isFile()) {
          var obj = {
            filename: filename,
            desc: filename
          }
          onlyFiles.push(obj);
        }

        iterator(index + 1);
      });
    })(0);
  });
}

/**
* Handle an incoming request, direct a request to the correct function.
*/
function handleIncomingRequest(req, res) {
  console.log('Incoming Request: ' + req.method + ' ' + req.url);

  req.parsedUrl = url.parse(req.url, true);
  var coreUrl = req.parsedUrl.pathname;

  if (coreUrl == '/albums.json') {
    handleListAlbums(req, res);
  }
  else if (coreUrl.substr(0, 7) == '/albums' && coreUrl.substr(coreUrl.length - 5) == '.json') {
    handleGetAlbum(req, res);
  }
  else {
    sendFailure(res, 404, invalidResource());
  }
}

/**
* Handle request to list albums.
*/
function handleListAlbums(req, res) {
  loadAlbumList(function(err, albums) {
    if (err) {
      sendFailure(res, 500, err);
      return;
    }

    sendSuccess(res, {
      albums: albums
    });
  });
}

/**
* Handle request to list files within an album.
*/
function handleGetAlbum(req, res) {
  // Get the GET params.
  var getParams = req.parsedUrl.query;
  var defaults = {
    pageNum: 0,
    pageSize: 1000
  };
  var pageNum = getParams.page || defaults.pageNum;
  var pageSize = getParams.pageSize || defaults.pageSize;

  // Ensure passed parameters are numerical.
  pageNum = (isNaN(parseInt(pageNum))) ? defaults.pageNum : pageNum;
  pageSize = (isNaN(parseInt(pageSize))) ? defaults.pageSize : pageNum;

  // Define a shorthand for the cure url.
  // Format of a request is /albums/album_name.json
  var coreUrl = req.parsedUrl.pathname;

  // Format of request is /albums/album_name.json
  var albumName = coreUrl.substr(7, coreUrl.length - 12);

  // Set parameters to be passed to loadAlbum function.
  var loadAlbumParams = {
    albumName: albumName,
    pageNum: pageNum,
    pageSize: pageSize,
  };

  loadAlbum(loadAlbumParams, function(err, albumContents) {
    if (err && err.error == 'no_such_album') {
      sendFailure(res, 404, err);
    }
    else if (err) {
      sendFailure(res, 500, err);
    }
    else {
      sendSuccess(res, {
        album_data: albumContents
      });
    }
  });
}

/**
* Error generator.
*/
function makeError(err, msg) {
  var e = new Error(msg);
  e.code = err;
  return e;
}

/**
* Success sender function.
*/
function sendSuccess(res, data) {
  res.writeHead(200, {
    "Content-Type" : "application/json"
  });
  var output = {
    error: null,
    data: data
  }
  res.end(JSON.stringify(output) + "\n");
}

/**
* Failure sender function.
*/
function sendFailure(res, code, err) {
  var code = (err.code) ? err.code : err.name;
  res.writeHead(code, {
    "Content-Type" : "application/json"
  });
  var data = JSON.stringify({
    error: code,
    message: err.message
  });
  res.end(data + "\n");
}

/**
* Function to signal that a resource does not exist.
*/
function invalidResource() {
  return makeError('invalid_resource', 'The requested resource does not exists.');
}

/**
* Function to signal that an album does not exist.
*/
function noSuchAlbum() {
  return makeError('no_such_album', 'The specified album does not exist');
}

var s = http.createServer(handleIncomingRequest);
s.listen(8080);






