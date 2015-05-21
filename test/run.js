var useRat = require('../use-rat').processString;
var STR = require('./str');

module.exports = run;

function run(t, src, out) {
  var r = useRat(STR(src));
  t.equal(r, STR(out), 'equal')
}
