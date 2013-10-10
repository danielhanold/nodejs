var fs = require('fs');

fs.open(
  'info.txt', 'r',
  function(err, handle) {
    if (err) {
      console.log('Error: ' + err.code + ' (' + err.message + ')');
    }
    else {
      var buf = new Buffer(100000);
      fs.read(
        handle, buf, 0, 10000, null,
        function(err, length) {
          if (err) {
            console.log('Error: ' + err.code + ': ' + err.message);
          }
          else {
            console.log(buf.toString('utf8', 0, length));
            fs.close(handle, function() {
              /* don't care yet  */
            });
          }
        }
      );
    }
  }
);
