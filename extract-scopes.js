var estraverse = require('estraverse');

module.exports = extractScopes;

function contained(node, array) {
  var w = node;
  while (w) {
    if (array.indexOf(w) > -1) {
      return true;
    }

    w = w.parent;
  }

  return false;
}

function extractScopes(ast) {
  var scopes = [];
  var path = [];
  var lastNode = null;
  estraverse.traverse(ast, {
    enter: function(node, parent) {

      // ensure we have access to parents
      node.parent = parent;

      if (node.type === 'ExpressionStatement' && node.expression.value === 'use rat') {
        if (contained(parent, scopes)) {
          return;
        }


        scopes.push(parent);
        var p = parent;
        if (p.body) {
          p = p.body;
        }

        for (var i = 0; i<p.length; i++) {
          if (p[i] === node) {
            p.splice(i, 1);
            break;
          }
        }
      }
    }
  });

  return scopes;
}
