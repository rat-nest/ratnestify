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
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_add = require('rat-vec/add');",
    'var a = rat_add(rat_scalar(1, 2), rat_scalar(1, 2));'
  ].join('\n'), 'replace ops with fn calls');
  t.end();
}));

test('rat addition (vars)', runFixture('addition-vars.js', function(t, r) {
  t.equal(r, [
    "var rat_add = require('rat-vec/add');",
    "var rat_scalar = require('rat-vec/scalar');",
    'var a = rat_scalar(1, 2);',
    'var b = rat_scalar(2, 2);',
    'var c = rat_add(a, b);',
  ].join('\n'), 'replace ops with fn calls');

  t.end();
}));

test('rat scoped in function', runFixture('scoped.js', function(t, r) {
  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_add = require('rat-vec/add');",
    'function someFunction() {',
    '    var a = rat_add(rat_scalar(1, 2), rat_scalar(2, 1));',
    '    return a;',
    '}',
    'console.log(someFunction());'
  ].join('\n'),'replace ops with fn calls');

  t.end();
}));

test('rat vec2 (2 component)', function(t) {
  var r = useRat('"use rat"\nvec2(1, 2);');

  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'rat_vec([',
    '    1,',
    '    2',
    ']);',
  ].join('\n'), 'fill in the other component');

  t.end();
});

test('rat vec2 (1 component)', function(t) {
  var r = useRat('"use rat"\nvec2(5)');


  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'rat_vec([',
    '    5,',
    '    5',
    ']);',].join('\n'), 'fill in the other component');


  t.end();
});

test('rat vec4 (1 component)', function(t) {
  var r = useRat('"use rat"\nvec4(5)');

  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'rat_vec([',
    '    5,',
    '    5,',
    '    5,',
    '    5',
    ']);',].join('\n'), 'fill in the other component');

  t.end();
});

test('rat vec4 (4 components)', function(t) {
  var r = useRat('"use rat"\nvec4(1,2,3,4)');

  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'rat_vec([',
    '    1,',
    '    2,',
    '    3,',
    '    4',
    ']);',].join('\n'), 'fill in the other component');

  t.end();
});

test('rat vec1 non-assignment accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec1(1);',
    'console.log(v.x)',
  ].join('\n'));

  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([1]);',
    'console.log([',
    '    v[0],',
    '    v[1]',
    ']);',
  ].join('\n'), 'fill in the other component');

  t.end();
});

test('rat vec3 non-assignment accessor + swizzling', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'console.log(v.xz)',
  ].join('\n'));

  t.equal(r, [
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'console.log([',
    '    v[0],',
    '    v[2],',
    '    v[3]',
    ']);',
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 assignment (single)', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.x = 1/2',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_scalar(1, 2);',
    'rat_set(v, 0, rat_tmp0);'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 assignment (multiple)', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.xz = 1/2',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_scalar(1, 2);',
    'rat_set(v, 0, rat_tmp0);',
    'rat_set(v, 2, rat_tmp0);'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle assignment (vec2)', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.xz = vec2(1/2, 1/4);',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4)',
    ']);',
    'rat_set(v, 0, rat_get(rat_tmp0, 0));',
    'rat_set(v, 2, rat_get(rat_tmp0, 1));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle assignment from swizzle accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx = vec4(1/2, 1/4, 1/8, 1/16).wxy;',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4),',
    '    rat_scalar(1, 8),',
    '    rat_scalar(1, 16)',
    ']);',
    'rat_set(v, 2, rat_get(rat_tmp0, 3));',
    'rat_set(v, 1, rat_get(rat_tmp0, 0));',
    'rat_set(v, 0, rat_get(rat_tmp0, 1));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle += from swizzle accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx += vec4(1/2, 1/4, 1/8, 1/16).wxy;',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_add = require('rat-vec/add');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4),',
    '    rat_scalar(1, 8),',
    '    rat_scalar(1, 16)',
    ']);',
    'rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(rat_tmp0, 3)));',
    'rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(rat_tmp0, 0)));',
    'rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(rat_tmp0, 1)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 += itself', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v += v',
  ].join('\n'));

  t.equal(r, [
    "var rat_add = require('rat-vec/add');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(v, 0)));',
    'rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(v, 1)));',
    'rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(v, 2)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle and += itself', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx += v',
  ].join('\n'));

  t.equal(r, [
    "var rat_add = require('rat-vec/add');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(v, 0)));',
    'rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(v, 1)));',
    'rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(v, 2)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle -= from swizzle accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx -= vec4(1/2, 1/4, 1/8, 1/16).wxy;',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_sub = require('rat-vec/sub');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4),',
    '    rat_scalar(1, 8),',
    '    rat_scalar(1, 16)',
    ']);',
    'rat_set(v, 2, rat_sub(rat_get(v, 2), rat_get(rat_tmp0, 3)));',
    'rat_set(v, 1, rat_sub(rat_get(v, 1), rat_get(rat_tmp0, 0)));',
    'rat_set(v, 0, rat_sub(rat_get(v, 0), rat_get(rat_tmp0, 1)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle *= from swizzle accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx *= vec4(1/2, 1/4, 1/8, 1/16).wxy;',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_mul = require('rat-vec/mul');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4),',
    '    rat_scalar(1, 8),',
    '    rat_scalar(1, 16)',
    ']);',
    'rat_set(v, 2, rat_mul(rat_get(v, 2), rat_get(rat_tmp0, 3)));',
    'rat_set(v, 1, rat_mul(rat_get(v, 1), rat_get(rat_tmp0, 0)));',
    'rat_set(v, 0, rat_mul(rat_get(v, 0), rat_get(rat_tmp0, 1)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

test('rat vec3 swizzle /= from swizzle accessor', function(t) {
  var r = useRat([
    '"use rat"',
    'var v = vec3(1, 2, 3);',
    'v.zyx /= vec4(1/2, 1/4, 1/8, 1/16).wxy;',
  ].join('\n'));

  t.equal(r, [
    "var rat_scalar = require('rat-vec/scalar');",
    "var rat_div = require('rat-vec/div');",
    "var rat_get = require('rat-vec/get');",
    "var rat_set = require('rat-vec/set');",
    "var rat_vec = require('rat-vec/vec');",
    'var v = rat_vec([',
    '    1,',
    '    2,',
    '    3',
    ']);',
    'var rat_tmp0 = rat_vec([',
    '    rat_scalar(1, 2),',
    '    rat_scalar(1, 4),',
    '    rat_scalar(1, 8),',
    '    rat_scalar(1, 16)',
    ']);',
    'rat_set(v, 2, rat_div(rat_get(v, 2), rat_get(rat_tmp0, 3)));',
    'rat_set(v, 1, rat_div(rat_get(v, 1), rat_get(rat_tmp0, 0)));',
    'rat_set(v, 0, rat_div(rat_get(v, 0), rat_get(rat_tmp0, 1)));'
  ].join('\n'), 'new rat-vec');

  t.end();
});

/*

TODO: handle ops on right

"use rat"
var v = vec3(1, 2, 3);
var v2 = vec2(5, 5);
v.z = v2.x + v2.y;
*/

// TODO: left/right mismatch: v.x = v2.xy

/*

TODO: follow assignment

var v = vec2(1, 2);
var a = v;
a.x = 1/2

*/

/*

TODO: += component

var v = vec2(1, 2);
var a = v;
a.x += 1/2

--------------

var v = vec2(1, 2);
var x = v.x;
x += 1/2

*/

// TODO: test `var a = vec2(1, 2) / vec2(1/2) + vec2(1/4);`

test('play', function(t) {
    var r = useRat([
    '"use rat"',
    'var a = (vec2(1, 2) + vec2(1/2)) / vec10(1/4)',
  ].join('\n'));
  console.log(r);
  t.end()
})















