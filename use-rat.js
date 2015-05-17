var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var through = require('through2')
var clone = require('clone');

onFile.processFile = processFile
module.exports = onFile;

function onFile(filename, flags) {
  return through(function(d, enc, cb) {
    var r = processFile(d.toString());
    this.push(r)
    cb();
  })
}

function vecLetterToNumber(letter) {
  // TODO: handle access out of range
  switch (letter) {
    case 'x':
      return 0;
    break;
    case 'y':
      return 1;
    break;
    case 'z':
      return 2
    break;
    case 'w':
      return 3;
    break;
  }
  return null;
}

function processFile(code, extraRequires) {
  extraRequires = extraRequires || [];
  var tmp_id = 0;
  var ast = esprima.parse(code);

  // locate 'use rat'
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
    }
  });

  function createOp(name) {
    return function(left, right) {

      if (left.type === 'Literal') {
        ratFromScalar(left);
      }

      if (right.type === 'Literal') {
        ratFromScalar(right);
      }

      return name;
    }
  }

// TODO: rat-vec bindings

  var moduleMap = {
    'rat': 'rat-vec/',
    'rat_vec': 'rat-vec/',
    'rat_mat': 'rat-mat/'
  }

  var used = {};
  var useMap = {
    '/' : function(left, right, ast) {
      if (left.type === 'Literal' && right.type === 'Literal') {
        return 'rat_scalar'
      } else {

        // a/4
        if (right.type === 'Literal') {
          return 'rat_divs';
        }

        // 4/a = rat_div(rat_scalar(4,1), a)
        if (left.type === 'Literal') {
          requireRatFn(ast, 'rat_scalar', moduleMap.rat + 'scalar', used);
          ratFromScalar(left);
        }

        return 'rat_div'
      }
    },
    '*' : createOp('rat_mul'),
    '+' : createOp('rat_add'),
    '-' : createOp('rat_sub')
  }

  // console.log(JSON.stringify(ast, null, '  '));

  var trackedVariables = {};

  locations.forEach(function(location) {

    var binaryExpressions = [];

    estraverse.traverse(location, {
      enter: function enter(node, parent) {
        // avoid double processing of nodes
        if (node._seen) { return; }
        node._seen = true;

        if (node.type === 'BinaryExpression') {
          var ratOp = useMap[node.operator];
          var varName = buildBinaryFunction(ratOp, node, ast);
          binaryExpressions.push(varName);
        } else if (node.type === 'CallExpression' && node.callee.name && node.callee.name.indexOf('vec') > -1) {
          var name = node.callee.name;
          var dim = parseInt(name.substring(3), 10);
          node.callee.name = 'rat_vec'
          node._rat_type = 'vec';
          node._rat_length = dim;
          node._rat_accessors = new Array(dim);

          if (parent.property) {
            var swizzle = parent.property.name;

            var l = swizzle.length;
            for (var i=0; i<l; i++) {
              node._rat_accessors[i] = vecLetterToNumber(swizzle[i]);
            }
          } else {
            for (var i=0; i<dim; i++) {
              node._rat_accessors[i] = i;
            }
          }
          requireRatFn(ast, node.callee.name, 'rat-vec/vec', used)

          var args = node.arguments.slice();
          node.arguments = [{
            type: "ArrayExpression",
          }];

          if (dim === args.length) {
            // replace the args with an array of the args
            node.arguments[0].elements = args;

          } else {
            var rargs = node.arguments;
            var arg = args[0];
            rargs[0].elements = new Array(dim);
            var elements = rargs[0].elements;

            for (var i=0; i<dim; i++) {
              elements[i] = arg;
            }
          }

          if (parent.type === 'VariableDeclarator') {
            trackedVariables[parent.id.name] = {
              component : vecLetterToNumber,
              node: node,
              parent: parent,
              length: dim
            }
          }


        } else if (node.type === 'MemberExpression') {
          var variable = node.object.name;
          var tracked = trackedVariables[variable];
          if (tracked) {
            if (parent.type === 'CallExpression') {
              var prop = node.property.name;

              var l = prop.length;
              var r = {
                type: "ArrayExpression",
                elements: Array(l+1)
              }
              for (var i=0; i<l; i++) {
                var component = trackedVariables[variable].component(prop[i]);
                r.elements[i] = {
                  type: 'MemberExpression',
                  computed: true,
                  object: node.object,
                  property: {
                    type: 'Literal',
                    value: component,
                    raw: component+'',
                  }
                }
              }

              var denom = trackedVariables[variable].length
              r.elements[l] = {
                type: 'MemberExpression',
                computed: true,
                object: node.object,
                property: {
                  type: 'Literal',
                  value: denom,
                  raw: denom+'',
                }
              }

              parent.arguments = [r];
            }
          }
        } else if (node.type === 'ExpressionStatement') {
          // TODO: for swizzle, find where the statement exists
          //       in the parent and inject the other components
          if (node.expression.type === 'AssignmentExpression') {

            // handle conversion on the left
            var left = node.expression.left;
            var variable = trackedVariables[left.object.name];
            var loc = 1

            // TODO: other locations
            // TODO: right side dependent operations
            var array = parent.body;
            var loc = array.indexOf(node);
            array.splice(loc, 1);

            // ensure the right side has been processed prior
            // to creating assignments
            var right = node.expression.right;

            // expect a swizzle
            if (right.type === 'MemberExpression') {

              enter(right.object, right);
              if (right.object._rat_type) {
                right = right.object;
              }

            }

            enter(right, node);

            // now, if the right side is some sort of rat_*
            // then we need to store it as a var and replace
            // right with the appropriate value
            if (right._rat_type) {
              var id = tmp_id++;
              array.splice(loc, 0, {
                type: "VariableDeclaration",
                declarations: [{
                  type: "VariableDeclarator",
                  id: {
                    type: "Identifier",
                    name: "rat_tmp" + id
                  },
                  init: right
                }],
                kind: "var"
              });
            }

            if (variable) {
              var prop = left.property.name;
              var l = prop.length;
              var a;
              for (var i=0; i<l; i++) {

                // TODO: multiple assignments

                a = clone(node);
                array.splice(loc+i+1, 0, a);

                var index = variable.component(prop[i]);
                a.expression.left.computed=true;
                a.expression.left.property = {
                  type: 'Literal',
                  value: index,
                  raw: index+''
                }

                if (!right._rat_type || right._rat_length <= 1) {
                  a.expression.right = {
                    "type": "Identifier",
                    "name": "rat_tmp" + id
                  };
                } else {
                  a.expression.right = {
                    type: "MemberExpression",
                    computed: true,
                    object: {
                      type: "Identifier",
                      name: "rat_tmp" + id
                    },
                    property: {
                      type: "Literal",
                      value: right._rat_accessors[i],
                      raw: right._rat_accessors[i] + ""
                    }
                  };
                }
              }
            }
          }
        }
      },
      exit : function(node, parent) {
        path.pop(node);
      }
    })

    binaryExpressions.reverse().forEach(function(varName) {
      var m = varName.split('_')
      var file = m.pop();
      requireRatFn(ast, varName, moduleMap[m.join('_')] + file, used);
    });
  });

  // process the ast to replace stuff

  // console.log(JSON.stringify(ast, null, '  '));


  return escodegen.generate(ast);
}


function requireRatFn(ast, varName, moduleName, used) {
  if (used[varName]) { return }
  used[varName] = true;

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
    kind: "var"
  });
}

function ratFromScalar(node) {
  node.type = 'CallExpression';
  node.callee = {
    type: 'Identifier',
    name: 'rat_scalar'
  };

  node._rat_type = 'rat_scalar';

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

function buildBinaryFunction(op, node, ast) {
  var name = op(node.left, node.right, ast)

  node.type = 'CallExpression';
  node.callee = {
    type: 'Identifier',
    name: name
  };
  node._rat_type = name;

  if (name === 'rat_scalar') {
    node._rat_length = 1;
  }

  node.arguments = [
    node.left,
    node.right
  ];

  return name;
}
