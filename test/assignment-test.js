var STR = require('./str');
var test = require('tape');
var useRat = require('../use-rat').processString;

function run(t, src, out) {
  var r = useRat(STR(src));
  t.equal(r, STR(out), 'equal')
}

test('var v = vec1(1)', function(t) {
  run(t, function() {
    "use rat"
    var v = vec1(1);
  }, function() {
    var rat_vec = require('rat-vec/vec');
    var v = rat_vec([1]);
  });

  t.end();
});

// test('var v = vec2(1).x', function(t) {
//   run(t, function() {
//     "use rat"
//     var v = vec2(1).x;
//   }, function() {
//     var rat_vec = require('rat-vec/vec');
//     var v = rat_get(rat_vec([
//         1,
//         1
//     ]), 0);
//   });

//   t.end();
// });
