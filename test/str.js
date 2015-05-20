
module.exports = function STR(fn) {
  var s = fn.toString();
  var lines = s.split('\n').slice(1, -1)
  var indent = /[ \t]*/.exec(lines[0])[0];

  return lines.map(function(line) {
    return line.replace(indent, '');
  }).join('\n');
}
