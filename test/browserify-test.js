var test = require('tape');
var browserify = require('browserify');
var path = require('path');

test('basic bundling', function(t) {

  var b = browserify();
  b.add(path.join(__dirname, 'fixture', 'scoped.js'));
  b.transform(path.join(__dirname, '..', 'use-rat.js'));

  b.bundle()//.pipe(process.stdout);
  t.end();

});
