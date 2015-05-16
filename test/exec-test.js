var test = require('tape');
var fs = require('fs');
var path = require('path');
var useRat = require('../use-rat').processFile;
var spawn = require('child_process').spawn;
var concat = require('concat-stream');
var tmp = require('tmp');

function execute(code, fn) {
  tmp.file({ dir: __dirname }, function(e, file, o, clean) {
    var contents = useRat(code.toString());
    fs.writeFile(file, contents, function(writeError) {
      spawn('node', [file], { stdio: 'pipe' })
      .stdout.pipe(concat(function(d) {
        clean();
        fn(d.toString());
      }));
    });
  });
}

test('exec scoped.js', function(t) {
  var fixture = path.join(__dirname, 'fixture', 'scoped.js');

  fs.readFile(fixture, function(e, buf) {
    execute(buf, function(r) {
      t.equal(r.toString(), '[ <BN: 5>, <BN: 2> ]\n');
      t.end();
    });
  });
});

test('exec vec2 (one component)', function(t) {
  execute('"use rat";console.log(vec2(1))', function (r) {
    t.equal(r,
      '[ <BN: 1>, <BN: 1>, <BN: 1> ]\n',
      'built a 2 component vector'
    );
    t.end();
  });
});

test('exec vec2 (two components)', function(t) {
  execute('"use rat";console.log(vec2(1/2, 1/4))', function (r) {
    t.equal(r,
      '[ <BN: 1>, <BN: 2>, <BN: 4> ]\n',
      'built a 2 component vector'
    );
    t.end();
  });
});
