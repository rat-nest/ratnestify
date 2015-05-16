var test = require('tape');
var browserify = require('browserify');
var path = require('path');
var tmp = require('tmp');
var fs = require('fs');

test('basic bundling', function(t) {
  tmp.file(function(e, file, n, clean) {

    t.error(e, 'created tmp file')
    var b = browserify();
    b.add(path.join(__dirname, 'fixture', 'scoped.js'));
    b.transform(path.join(__dirname, '..', 'use-rat.js'));

    b.bundle()
    clean();
    t.end();
  });
});
