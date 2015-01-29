var builder = require('../index');

var err = function(e) {
  setTimeout(function() {
    throw e;
  });
}

console.log('Running a multi-format build...');

builder.loadConfig('./cfg.js')
.then(function() {

  builder.build('tree/first', 'tree-build.js', { sourceMaps: true })
  .then(function() {
    console.log('Done');
  })
  .catch(err);

  var treeFirst;
  builder.trace('tree/first').then(function(traceTree) {
    treeFirst = traceTree.tree;
    // console.log(JSON.stringify(traceTree, null, 2));
  })
  .then(function() {
    console.log('Build exclusion');
    return builder.trace('tree/amd');
  })
  .then(function(traceTree) {
    depTree = traceTree;
    return builder.buildTree(
      builder.subtractTrees(treeFirst, traceTree.tree), 'excluded.js'
    );
  })

  .then(function() {
    return builder.trace('tree/global-inner').then(function(trace) {
      return builder.buildTree(trace.tree, 'global-inner.js');
    });
  })

  .then(function() {
    return builder.trace('tree/global-outer').then(function(trace) {
      return builder.buildTree(trace.tree, 'global-outer.js');
    });
  })

  .then(function() {
    return builder.trace('tree/amd-1').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-1.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-2').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-2.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-3').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-3.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-4').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-4.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-5a').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-5a.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-5b').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-5b.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-6a').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-6a.js');
    })
  })

  .then(function() {
    return builder.trace('tree/amd-6b').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'amd-6b.js');
    })
  })

  .then(function() {
    return builder.trace('tree/umd').then(function(trace) {
      return builder.buildTree(builder.subtractTrees(trace.tree, treeFirst), 'umd.js');
    })
  })

  .then(function() {
    return builder.build('tree/amd-7', 'amd-7.js');
  })

  .then(function() {
    return builder.buildSFX('tree/amd-1', 'sfx.js');
  })

  .catch(err);

})
.catch(err);

