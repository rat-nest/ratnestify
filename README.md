# ratnestify

browserify transform for converting normal arithmetic to rational via a "use rat" mode.

## install

`npm install ratnestify`

## use

ratnestify uses a `'use rat'` mode flag that will change the the behavior of javascript in that block.

for example:
```javascript
"use rat";

1/2 + 1/2
```

will be converted into:

```javascript
var rat_scalar = require('rat-vec/scalar');
var rat_add = require('rat-vec/add');
rat_add(rat_scalar(1, 2), rat_scalar(1, 2))
```

### why is this useful?

writing code like the produced code above is sort of a pain to write and scan.  Why not just use regular arithmetic and have the computer convert it to the appropriate form?

While we're at it, we might as well add some other nicities that allow more expressive operations on vectors and matrices

### 

For vector and matrix types we try to adhere to the amazing interface exposed by [glsl]()'s types.

__vecN__() - arbitrary dimension `N` vector constructor

```javascript
"use rat"

vec2(1, 2);
vec2(1); // this is the same as saying vec2(1, 1)
vec10(4); // same as vec10(4, 4, 4, 4, 4, 4, 4, 4, 4, 4)
```
