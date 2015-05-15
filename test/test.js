var test = require('tape');
var fs = require('fs');
var path = requie('path');
var esprima = require('esprima');

var fixtures = path.join(__dirname, 'fixture');

var simpleAddition = fs.readFileSync(path.join(fixtures, 'simple-addition.js')).toString();


test('use rat', function() {






});
