var test = require('tape');
var fs = require('fs');
var path = require('path');

var fixtures = path.join(__dirname, 'fixture');
var useRat = require('../use-rat').processFile;

function runFixture(fixture, fn) {
  return function(t) {
    fs.readFile(path.join(fixtures, fixture), function(e, d) {
      t.error(e, 'read fixture: ' + fixture);
      fn(t, useRat(d.toString()))
    });
  }
}

test('division', function(t) {
  var r = useRat('"use rat"\nvar a = b/c');
  t.equal(r, [
    "var rat_div = require('rat-vec/div');",
    'var a = rat_div(b, c);'
  ].join('\n'), 'rat_div');
  t.end();
});

test('division rat vs constant (denominator)', function(t) {
  var r = useRat('"use rat"\nvar a = b/5');
  t.equal(r, [
    "var rat_divs = require('rat-vec/divs');",
    'var a = rat_divs(b, 5);',
  ].join('\n'), 'rat_divs');
  t.end();
});

test('division rat vs constant (numerator)', function(t) {
  var r = useRat('"use rat"\nvar a = 5/b');
  t.equal(r, [
    "var rat_div = require('rat-vec/div');",
    "var rat_scalar = require('rat-vec/scalar');",
    'var a = rat_div(rat_scalar(5, 1), b);'
  ].join('\n'), 'rat_div');

  t.end();
});

test('rat addition (constants)', runFixture('simple-addition.js', function(t, r) {
  t.equal(r, [
    "var rat_add = require('rat-vec/add');",
    "var rat_scalar = require('rat-vec/scalar');",
    'var a = rat_add(rat_scalar(1, 2), rat_scalar(1, 2));'
  ].join('\n'), 'replace ops with fn calls');
  t.end();
}));

test('rat addition (vars)', runFixture('addition-vars.js', function(t, r) {
  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_add = require('rat-vec/add');",
    'var a = rat_scalar(1, 2);',
    'var b = rat_scalar(2, 2);',
    'var c = rat_add(a, b);',
  ].join('\n'), 'replace ops with fn calls');

  t.end();
}));

test('rat scoped in function', runFixture('scoped.js', function(t, r) {
  t.equal(r, [
    "var rat_add = require('rat-vec/add');",
    "var rat_scalar = require('rat-vec/scalar');",
    'function someFunction() {',
    '    var a = rat_add(rat_scalar(1, 2), rat_scalar(2, 1));',
    '    return a;',
    '}',
    'console.log(someFunction());'
  ].join('\n'),'replace ops with fn calls');

  t.end();
}));
