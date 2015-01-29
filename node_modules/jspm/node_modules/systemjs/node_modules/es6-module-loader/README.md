# ES6 Module Loader Polyfill [![Build Status][travis-image]][travis-url]

Dynamically loads ES6 modules in browsers and [NodeJS](#nodejs-use) with support for loading existing and custom module formats through loader hooks.

This project implements dynamic module loading through `System` exactly to the previous ES6-specified loader API at [2014-08-24 ES6 Specification Draft Rev 27, Section 15](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#august_24_2014_draft_rev_27) and will continue to track this API as it is re-drafted as a browser specification (currently most likely to be at https://github.com/whatwg/loader).

* Provides an asynchronous loader (`System.import`) to [dynamically load ES6 modules](##getting-started).
* Uses [Traceur](https://github.com/google/traceur-compiler) for compiling ES6 modules and syntax into ES5 in the browser with source map support.
* Fully supports [ES6 circular references and live bindings](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings).
* Includes [`baseURL` and `paths` implementations](https://github.com/ModuleLoader/es6-module-loader/wiki/Configuring-the-Loader).
* Can be used as a [tracing tool](https://github.com/ModuleLoader/es6-module-loader/wiki/Tracing-API) for static analysis of modules.
* Polyfills ES6 Promises in the browser with an optionally bundled ES6 promise implementation.
* Supports ES6 module loading in IE8+. Other ES6 features only supported by Traceur in IE9+.
* The complete combined polyfill, including ES6 promises, comes to 9KB minified and gzipped, making it suitable for production use, provided that modules are [built into ES5 making them independent of Traceur](https://github.com/ModuleLoader/es6-module-loader/wiki/Production-Workflows).

For an overview of build workflows, [see the production guide](https://github.com/ModuleLoader/es6-module-loader/wiki/Production-Workflows).

For an example of a universal module loader based on this polyfill for loading AMD, CommonJS and globals, see [SystemJS](https://github.com/systemjs/systemjs).

_The current version is tested against **[Traceur 0.0.79](https://github.com/google/traceur-compiler/tree/0.0.79)**._

### Documentation

* [A brief overview of ES6 module syntax](https://github.com/ModuleLoader/es6-module-loader/wiki/Brief-Overview-of-ES6-Module-syntax)
* [Configuring the loader](https://github.com/ModuleLoader/es6-module-loader/wiki/Configuring-the-Loader)
* [Production workflows](https://github.com/ModuleLoader/es6-module-loader/wiki/Production-Workflows)
* [Circular References &amp; Bindings](https://github.com/ModuleLoader/es6-module-loader/wiki/Circular-References-&-Bindings)
* [Extending the loader through loader hooks](https://github.com/ModuleLoader/es6-module-loader/wiki/Extending-the-ES6-Loader)
* [Tracing API](https://github.com/ModuleLoader/es6-module-loader/wiki/Tracing-API)

### Getting Started

Download both [es6-module-loader.js](https://raw.githubusercontent.com/ModuleLoader/es6-module-loader/v0.11.0/dist/es6-module-loader.js) and traceur.js into the same folder.

If using ES6 syntax (optional), include [`traceur.js`](https://raw.githubusercontent.com/jmcriffey/bower-traceur/0.0.79/traceur.js) in the page first then include `es6-module-loader.js`:

```html
  <script src="traceur.js"></script>
  <script src="es6-module-loader.js"></script>
```

Write an ES6 module:

mymodule.js:
```javascript
  export class q {
    constructor() {
      console.log('this is an es6 class!');
    }
  }
```

We can then load the module with the dynamic loader:

```html
<script>
  System.import('mymodule').then(function(m) {
    new m.q();
  });
</script>
```

The dynamic loader returns a `Module` object, which contains getters for the named exports (in this case, `q`).

#### Module Tag

As well as defining `window.System`, this polyfill provides support for the `<script type="module">` tag:

```html
<script type="module">
  // loads the 'q' export from 'mymodule.js' in the same path as the page
  import { q } from 'mymodule';

  new q(); // -> 'this is an es6 class!'
</script>
```

Because it is only possible to load ES6 modules with this tag, it is not suitable for production use in this way.

See the [demo folder](https://github.com/ModuleLoader/es6-module-loader/blob/master/demo/index.html) in this repo for a working example demonstrating both module loading the module tag in the browser.

#### NodeJS Use

```
  npm install es6-module-loader
```

For use in NodeJS, the `Loader` and `System` globals are provided as exports:

index.js:
```javascript
  var System = require('es6-module-loader').System;

  System.import('some-module').then(function(m) {
    console.log(m.p);
  });
```

some-module.js:
```javascript
  export var p = 'NodeJS test';
```

Running the application:
```
> node index.js
NodeJS test
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Credit
Copyright (c) 2014 Luke Hoban, Addy Osmani, Guy Bedford

## License
Licensed under the MIT license.

[travis-url]: https://travis-ci.org/ModuleLoader/es6-module-loader
[travis-image]: https://travis-ci.org/ModuleLoader/es6-module-loader.svg?branch=master
