var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var through = require('through2')

onFile.processFile = processFile
module.exports = onFile;

function onFile(filename, flags) {
  return through(function(d, enc, cb) {
    var r = processFile(d.toString());
    this.push(r)
    cb();
  })
}

function processFile(code, extraRequires) {
  extraRequires = extraRequires || [];

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

  function createOp(name) {
    return function(left, right) {

      if (left.type === 'Literal') {
        ratFracIt(left);
      }

      if (right.type === 'Literal') {
        ratFracIt(right);
      }

      return name;
    }
  }

// TODO: rat-vec bindings

  var moduleMap = {
    'rat': 'a-rat/',
    'rat_vec': 'rat-vec/',
    'rat_mat': 'rat-mat/'
  }

  var used = {};
  var useMap = {
    '/' : function(left, right) {
      if (left.type === 'Literal' && right.type === 'Literal') {
        return 'rat_frac'
      } else {

        // a/4
        if (right.type === 'Literal') {
          return 'rat_divs';
        }

        // 4/a = rat_div(rat_frac(4,1), a)
        if (left.type === 'Literal') {
          ratFracIt(left);
        }

        return 'rat_div'
      }
    },
    '*' : createOp('rat_mul'),
    '+' : createOp('rat_add'),
    '-' : createOp('rat_sub')
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

      var varName = buildBinaryFunction(ratOp, expr);
      if (!used[varName]) {
        used[varName] = true;
        var m = varName.split('_')
        var file = m.pop();
        requireRatFn(ast, varName, moduleMap[m.join('_')] + file);
      }
    });
  });

  // process the ast to replace stuff

  // console.log(JSON.stringify(ast, null, '  '));


  return escodegen.generate(ast);
}

function requireRatFn(ast, varName, moduleName) {
  ast.body.unshift({
    type: "VariableDeclaration",
    declarations: [{
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: varName
        },
        init: {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "require"
          },
          arguments: [
            {
              type: "Literal",
              value: moduleName,
              raw: "'" + moduleName + "'"
            }
          ]
        }
      }
    ],
    "kind": "var"
  });
}

function ratFracIt(node) {
  node.type = 'CallExpression';
  node.callee = {
    type: 'Identifier',
    name: 'rat_frac'
  };

  node.arguments = [{
    type: 'Literal',
    value: node.value,
    raw: node.raw
  }, {
    type: 'Literal',
    value: 1,
    raw: '1'
  }];
}

function buildBinaryFunction(op, node) {
  var name = op(node.left, node.right)

  node.type = 'CallExpression';
  node.callee = {
    type: 'Identifier',
    name: name
  };
  node.arguments = [
    node.left,
    node.right
  ];

  return name;
}
