var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

module.exports = processFile;


function processFile(code) {

  var ast = esprima.parse(code);

  // locate 'use rat'
  var path = [];
  var locations = [];
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === 'ExpressionStatement' && node.expression.value === 'use rat') {
        locations.push(parent);

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

        return estraverse.VisitorOption.REMOVE;
      }
    },
    exit : function(node, parent) {
      path.pop(node);
    }
  });

  var used = {};
  var useMap = {
    '/' : function(left, right) {
      if (left.type === 'Literal' && right.type === 'Literal') {
        return 'rat_frac'
      } else {
        return 'rat_div'
      }
    },
    '*' : function() { return 'rat_mul' },
    '+' : function() { return 'rat_add' },
    '-' : function() { return 'rat_sub }' }
  }
  locations.forEach(function(location) {

    var binaryExpressions = [];

    estraverse.traverse(location, {
      enter: function(node, parent) {
        if (node.type === 'BinaryExpression') {
          binaryExpressions.push(node);
        }
      },
      exit : function(node, parent) {
        path.pop(node);
      }
    })

    binaryExpressions.reverse().forEach(function(expr) {
      var ratOp = useMap[expr.operator];
      used[ratOp] = true;
      buildBinaryFunction(ratOp, expr);
    });
  });

  // process the ast to replace stuff

  // console.log(JSON.stringify(ast, null, '  '));


  return escodegen.generate(ast);
}


function buildBinaryFunction(op, node) {
  node.type = 'CallExpression';
  node.callee = {
    type: 'Identifier',
    name: op(node.left, node.right)
  };
  node.arguments = [
    node.left,
    node.right
  ];

  delete node.left;
  delete node.right
}
