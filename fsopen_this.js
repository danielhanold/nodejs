var fs = require('fs');

function FileObject() {
  this.filename = '';

  this.file_exists = function(callback) {
    var self = this;

    console.log('About to open: ' + self.filename);

    fs.open(self.filename, 'r', function(err, handle) {
      if (err) {
        console.log('Cannot open: ' + self.filename);
        callback(err);
      }
      else {
        fs.close(handle, function() {});
        callback(null, true);
      }
    });
  }
}

var fp = new FileObject();
fp.filename = "file_self_does_not_exist";

fp.file_exists(function(err, results) {
  if (err) {
    console.log("Aw, bummer: " + JSON.stringify(err));
  }
  else {
    console.log("file exists!!!");
  }
})