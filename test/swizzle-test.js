var test = require('tape');
var fs = require('fs');
var path = require('path');
var run = require('./run');

var useRat = require('../use-rat').processString;

test('rat vec1 non-assignment accessor', function(t) {
  run(t, function() {
    "use rat"
    var v = vec1(1);
    console.log(v.x)
  }, function() {
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([1]);
    console.log([
        v[0],
        v[1]
    ]);
  });

  t.end();
});

test('rat vec3 non-assignment accessor + swizzling', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    console.log(v.xz)
  }, function() {
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    console.log([
        v[0],
        v[2],
        v[3]
    ]);
  });

  t.end();
});

test('rat vec3 assignment (single)', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.x = 1/2
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_scalar(1, 2);
    rat_set(v, 0, rat_tmp0);
  });

  t.end();
});

test('rat vec3 assignment (multiple)', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.xz = 1/2
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_scalar(1, 2);
    rat_set(v, 0, rat_tmp0);
    rat_set(v, 2, rat_tmp0);
  });

  t.end();
});

test('rat vec3 swizzle assignment (vec2)', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.xz = vec2(1/2, 1/4);
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4)
    ]);
    rat_set(v, 0, rat_get(rat_tmp0, 0));
    rat_set(v, 2, rat_get(rat_tmp0, 1));
  });

  t.end();
});

test('rat vec3 swizzle assignment from swizzle accessor', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx = vec4(1/2, 1/4, 1/8, 1/16).wxy;
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4),
        rat_scalar(1, 8),
        rat_scalar(1, 16)
    ]);
    rat_set(v, 2, rat_get(rat_tmp0, 3));
    rat_set(v, 1, rat_get(rat_tmp0, 0));
    rat_set(v, 0, rat_get(rat_tmp0, 1));
  });

  t.end();
});

test('rat vec3 swizzle += from swizzle accessor', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx += vec4(1/2, 1/4, 1/8, 1/16).wxy;
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_add = require('rat-vec/add');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4),
        rat_scalar(1, 8),
        rat_scalar(1, 16)
    ]);
    rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(rat_tmp0, 3)));
    rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(rat_tmp0, 0)));
    rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(rat_tmp0, 1)));
  });

  t.end();
});

test('rat vec3 += itself', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v += v
  }, function() {
    var rat_add = require('rat-vec/add');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(v, 0)));
    rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(v, 1)));
    rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(v, 2)));
  });

  t.end();
});

test('rat vec3 swizzle and += itself', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx += v
  }, function() {
    var rat_add = require('rat-vec/add');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    rat_set(v, 2, rat_add(rat_get(v, 2), rat_get(v, 0)));
    rat_set(v, 1, rat_add(rat_get(v, 1), rat_get(v, 1)));
    rat_set(v, 0, rat_add(rat_get(v, 0), rat_get(v, 2)));
  });

  t.end();
});

test('rat vec3 swizzle -= from swizzle accessor', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx -= vec4(1/2, 1/4, 1/8, 1/16).wxy;
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_sub = require('rat-vec/sub');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4),
        rat_scalar(1, 8),
        rat_scalar(1, 16)
    ]);
    rat_set(v, 2, rat_sub(rat_get(v, 2), rat_get(rat_tmp0, 3)));
    rat_set(v, 1, rat_sub(rat_get(v, 1), rat_get(rat_tmp0, 0)));
    rat_set(v, 0, rat_sub(rat_get(v, 0), rat_get(rat_tmp0, 1)));
  });

  t.end();
});

test('rat vec3 swizzle *= from swizzle accessor', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx *= vec4(1/2, 1/4, 1/8, 1/16).wxy;
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_mul = require('rat-vec/mul');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4),
        rat_scalar(1, 8),
        rat_scalar(1, 16)
    ]);
    rat_set(v, 2, rat_mul(rat_get(v, 2), rat_get(rat_tmp0, 3)));
    rat_set(v, 1, rat_mul(rat_get(v, 1), rat_get(rat_tmp0, 0)));
    rat_set(v, 0, rat_mul(rat_get(v, 0), rat_get(rat_tmp0, 1)));
  });

  t.end();
});

test('rat vec3 swizzle /= from swizzle accessor', function(t) {
  var r = run(t, function() {
    "use rat"
    var v = vec3(1, 2, 3);
    v.zyx /= vec4(1/2, 1/4, 1/8, 1/16).wxy;
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_div = require('rat-vec/div');
    var rat_get = require('rat-vec/get');
    var rat_set = require('rat-vec/set');
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([
        1,
        2,
        3
    ]);
    var rat_tmp0 = rat_vec([
        rat_scalar(1, 2),
        rat_scalar(1, 4),
        rat_scalar(1, 8),
        rat_scalar(1, 16)
    ]);
    rat_set(v, 2, rat_div(rat_get(v, 2), rat_get(rat_tmp0, 3)));
    rat_set(v, 1, rat_div(rat_get(v, 1), rat_get(rat_tmp0, 0)));
    rat_set(v, 0, rat_div(rat_get(v, 0), rat_get(rat_tmp0, 1)));
  });

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

// test('play', function(t) {
//   var r = useRat(STR(function() {
//     "use rat"
//     var a = (vec2(1, 2) + vec2(1/2)) / vec10(1/4)
//   }));
//   console.log(r);
//   t.end()
// })
