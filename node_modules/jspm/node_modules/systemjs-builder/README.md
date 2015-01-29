SystemJS Build Tool
===

Provides a single-file build for SystemJS of mixed-dependency module trees.

Builds ES6 into ES3, CommonJS, AMD and globals into a single file in a way that supports the CSP SystemJS loader
as well as circular references.

Example
---

app.js
```javascript
import $ from "./jquery";
export var hello = 'es6';
```

jquery.js
```javascript
define(function() {
  return 'this is jquery';
});
```

Will build the module `app` into a bundle containing both `app` and `jquery` defined through `System.register` calls.

Circular references and bindings in ES6, CommonJS and AMD all behave exactly as they should, including maintaining execution order.

Usage
---

### Install

```javascript
  npm install systemjs-builder
```

### Basic Use

```javascript
  var builder = require('systemjs-builder');

  builder.build('myModule', 'outfile.js', {
    config: {
      baseURL: path.resolve('some/folder'),

      // any map config
      map: {
        jquery: 'jquery-1.2.3/jquery'
      },

      // etc. any SystemJS config
    }
  })
  .then(function() {
    console.log('Build complete');
  })
  .catch(function(err) {
    console.log('Build error');
    console.log(err);
  });
```

### Setting Configuration

To load a SystemJS configuration file, containing configure calls like:

```javascript
System.config({ ... });
```

Then we can load this config file through the builder:

```javascript
  var builder = require('systemjs-builder');

  // `builder.loadConfig` will load config from a file
  builder.loadConfig('./cfg.js')
  .then(function() {
    // additional config can also be set through `builder.config`
    builder.config({ baseURL: 'file:' + process.cwd() });
    
    return builder.build('myModule', 'outfile.js');
  });
  
```

Multiple config calls can be run, which will combine into the loader configuration.

To reset the loader state and configuration for a new build, run `builder.reset()`.


### SFX Bundles

To make a bundle that is independent of the SystemJS loader entirely, we can make SFX bundles:

```javascript
  var builder = require('systemjs-builder');
  builder.buildSFX('myModule', 'outfile.js', options);
```

This bundle file can then be included with a `<script>` tag, and no other dependencies (apart from Traceur runtime if needed) would need to be included in the page.

SFX bundles do not support custom exclusions and inclusions as there is no loader registry.

Rather, if it is needed to have globals like `jQuery` not included, as they will be separate globals, set up a wrapper module something like:

jquery.js
```javascript
  module.exports = window.jQuery;
```

### Minfication & Source Maps

As well as an `options.config` parameter, it is also possible to specify minification and source maps options:

```javascript
  var builder = require('systemjs-builder');
  builder.build('myModule', 'outfile.js', { minify: true, sourceMaps: true, config: cfg });
```

### Ignore Resources

If loading resources that shouldn't even be traced as part of the build (say an external import), these
can be configured with:

```javascript
System.meta['resource/to/ignore'] = {
  build: false
};
```

### Advanced build

The trace trees can be adjusted between tracing and building allowing for custom build layer creation.

Some simple trace tree operators are provided for subtraction addition and intersection.

Tree operations include `addTrees`, `subtractTrees`, `intersectTrees` and `extractTree`.

#### Example - Exclusion

In this example we build `app/core` excluding `app/corelibs`:

```javascript
  var builder = require('systemjs-builder');

  builder.config({
    baseURL: '...',
    map: {

    }, // etc. config
  });

  builder.trace('app/main')
  .then(function(appTree) {

    return builder.trace('app/corelibs')
    .then(function(coreTree) {
      return builder.subtractTrees(appTree, coreTree);
    });
  })
  .then(function(appMinusCoreTree) {
    return builder.buildTree(appMinusCoreTree, 'output-file.js');
  });
```

#### Example - Common Libraries

In this example we build `app/first` and `app/second` creating a separate `app/shared` library:

```javascript
  var builder = require('systemjs-builder');

  builder.config({
    // ...
  });

  var firstTree, secondTree, commonTree;

  builder.trace('app/first')
  .then(function(tree) {
    firstTree = tree;
    
    return builder.trace('app/second');
  })
  .then(function(tree) {
    secondTree = tree;
    commonTree = builder.intersectTrees(firstTree, secondTree);

    firstTree = builder.subtractTrees(firstTree, commonTree);
    secondTree = builder.subtractTrees(secondTree, commonTree);

    return builder.buildTree(firstTree, 'first-bundle.js');
  })
  .then(function() {
    return builder.buildTree(secondTree, 'second-bundle.js');
  })
  .then(function() {
    return builder.buildTree(commonTree, 'shared-bundle.js');
  });
```

License
---

MIT

