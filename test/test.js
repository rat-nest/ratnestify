var run = require('./run');
var test = require('tape');

test('division', function(t) {
  var r = run(t, function() {
    "use rat"
    var a = b/c;
  }, function() {
    var rat_div = require('rat-vec/div');
    var a = rat_div(b, c);
  });
  t.end();
});

test('division rat vs constant (denominator)', function(t) {
  var r = run(t, function() {
    "use rat"
    var a = b/5;
  }, function() {
    var rat_divs = require('rat-vec/divs');
    var a = rat_divs(b, 5);
  });
  t.end();
});

test('division rat vs constant (numerator)', function(t) {
  var r = run(t, function() {
    "use rat"
    var a = 5/b;
  }, function() {
    var rat_div = require('rat-vec/div');
    var rat_scalar = require('rat-vec/scalar');
    var a = rat_div(rat_scalar(5, 1), b);
  });

  t.end();
});

test('rat addition (constants)', function(t, r) {

  run(t, function() {
    'use rat'
    var a = 1/2 + 1/2
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_add = require('rat-vec/add');
    var a = rat_add(rat_scalar(1, 2), rat_scalar(1, 2));
  });

  t.end();
});

test('rat addition (vars)', function(t, r) {
  run(t, function() {
    'use rat'

    var a = 1/2;
    var b = 2/2;

    var c = a + b
  }, function() {
    var rat_add = require('rat-vec/add');
    var rat_scalar = require('rat-vec/scalar');
    var a = rat_scalar(1, 2);
    var b = rat_scalar(2, 2);
    var c = rat_add(a, b);
  });

  t.end();
});

test('rat scoped in function', function(t) {

  run(t, function() {
    function someFunction() {
      'use rat'
      var a = 1/2+2;
      return a;
    }

    console.log(someFunction());
  }, function() {
    var rat_scalar = require('rat-vec/scalar');
    var rat_add = require('rat-vec/add');
    function someFunction() {
        var a = rat_add(rat_scalar(1, 2), rat_scalar(2, 1));
        return a;
    }
    console.log(someFunction());
  });

  t.end();
});

test('rat vec2 (2 component)', function(t) {
  var r = run(t, function() {
    "use rat"
    vec2(1, 2);
  }, function() {
    var rat_vec = require('rat-vec/index');
    rat_vec([
        1,
        2
    ]);
  });

  t.end();
});

test('rat vec2 (1 component)', function(t) {
  run(t, function() {
    "use rat"
    vec2(5)
  }, function() {
    var rat_vec = require('rat-vec/index');
    rat_vec([
        5,
        5
    ]);
  });

  t.end();
});

test('rat vec4 (1 component)', function(t) {
  var r = run(t, function() {
    "use rat"
    vec4(5);
  }, function() {
    var rat_vec = require('rat-vec/index');
    rat_vec([
        5,
        5,
        5,
        5
    ]);
  });

  t.end();
});

test('rat vec4 (4 components)', function(t) {
  var r = run(t, function() {
    "use rat"
    vec4(1,2,3,4);
  }, function() {
    var rat_vec = require('rat-vec/index');
    rat_vec([
        1,
        2,
        3,
        4
    ]);
  })

  t.end();
});
