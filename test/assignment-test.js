var run = require('./run')
var test = require('tape');


test('var v = vec1(1)', function(t) {
  run(t, function() {
    "use rat"
    var v = vec1(1);
  }, function() {
    var rat_vec = require('rat-vec/index');
    var v = rat_vec([1]);
  });

  t.end();
});

// test('var v = vec2(1).x', function(t) {
//   run(t, function() {
//     "use rat"
//     var v = vec2(1).x;
//   }, function() {
//     var rat_vec = require('rat-vec/index');
//     var v = rat_get(rat_vec([
//         1,
//         1
//     ]), 0);
//   });

//   t.end();
// });
