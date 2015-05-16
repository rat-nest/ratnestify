var test = require('tape');
var fs = require('fs');
var path = require('path');
var useRat = require('../use-rat').processFile;
var spawn = require('child_process').spawn;
var concat = require('concat-stream');
var tmp = require('tmp');

test('exec scoped.js', function(t) {
  tmp.file({ dir: __dirname }, function(e, file, o, clean) {
    var c = fs.readFile(
      path.join(__dirname, 'fixture', 'scoped.js'),
      function(e, buf) {
        var contents = useRat(buf.toString());
        fs.writeFile(file, contents, function(writeError) {

          spawn('node', [file], { stdio: 'pipe' })
          .on('error', t.fail)
          .stdout.pipe(concat(function(d) {
            t.equal(d.toString(), '[ <BN: 5>, <BN: 2> ]\n');
            clean();
            t.end();
          }));
        });
      }
    )
  });
});
