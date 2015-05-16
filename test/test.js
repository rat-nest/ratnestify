var test = require('tape');
var fs = require('fs');
var path = require('path');

var fixtures = path.join(__dirname, 'fixture');
var useRat = require('../use-rat');

function runFixture(fixture, fn) {
  return function(t) {
    console.log(path.join(fixtures, fixture));
    fs.readFile(path.join(fixtures, fixture), function(e, d) {
      t.error(e, 'read fixture');
      fn(t, useRat(d.toString()))
    });
  }
}


test('use rat', runFixture('simple-addition.js', function(t, r) {


  t.equal(r, 'var a = rat_add(rat_frac(1, 2), rat_frac(1, 2));', 'replace ops with fn calls');
  t.end();
}));
