var test = require('tape')
var fixtures = {
  fnScope : require('./fixture/function-scope.json'),
  fnAndGlobalScope : require('./fixture/function-and-global-scope.json'),
  nestedScope : require('./fixture/nested-scope.json'),
}

var extract = require('../extract-scopes')

test('extract scope from functions', function(t) {
  var scopes = extract(fixtures.fnScope);

  t.equal(scopes.length, 2, 'found 2 scopes');
  t.equal(scopes[0].parent.type, 'FunctionDeclaration', 'is function scope')
  t.equal(scopes[0].parent.id.name, 'a', 'is fn a')

  t.equal(scopes[1].parent.type, 'FunctionDeclaration', 'is function scope')
  t.equal(scopes[1].parent.id.name, 'b', 'is fn b')

  t.end();
});

test('global overrides all', function(t) {
  var scopes = extract(fixtures.fnAndGlobalScope);

  t.equal(scopes.length, 1, 'found 1 scopes');
  t.equal(scopes[0].type, 'Program', 'is function scope')
  t.equal(scopes[0].parent, null, 'root level')

  t.end();
});

test('nested "use rat"s are ignored', function(t) {
  var scopes = extract(fixtures.nestedScope);

  t.equal(scopes.length, 1, 'found 1 scopes');
  t.equal(scopes[0].parent.type, 'FunctionDeclaration', 'is function scope')
  t.equal(scopes[0].parent.id.name, 'a', 'is fn a')

  t.end();
});
