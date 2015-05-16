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
  t.equal(r, 'var a = rat_div(b, c);', 'rat_div');
  t.end();
});

test('division rat vs constant', function(t) {
  var r = useRat('"use rat"\nvar a = b/5');
  t.equal(r, 'var a = rat_divs(b, 5);', 'rat_div');
  t.end();
});

test('division rat vs constant', function(t) {
  var r = useRat('"use rat"\nvar a = 5/b');
  t.equal(r, 'var a = rat_div(rat_frac(5, 1), b);', 'rat_div');
  t.end();
});

test('rat addition (constants)', runFixture('simple-addition.js', function(t, r) {
  t.equal(r, 'var a = rat_add(rat_frac(1, 2), rat_frac(1, 2));', 'replace ops with fn calls');
  t.end();
}));

test('rat addition (vars)', runFixture('addition-vars.js', function(t, r) {
  t.equal(r,
    'var a = rat_frac(1, 2);\nvar b = rat_frac(2, 2);\nvar c = rat_add(a, b);',
    'replace ops with fn calls'
  );
  t.end();
}));

test('rat scoped in function', runFixture('scoped.js', function(t, r) {
  t.equal(r,
    ['function someFunction() {',
    '    var a = rat_add(rat_frac(1, 2), rat_frac(2, 1));\n}'].join('\n'),
    'replace ops with fn calls'
    );
  t.end();
}));
