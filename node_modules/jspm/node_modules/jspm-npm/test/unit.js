var npmLocation = require('../npm');


function testDependency(name, value, expectedName, expectedValue) {
  var deps = {};
  deps[name] = value;
  deps = npmLocation.parseDependencies(deps);

  for (var p in deps) {
    if (p != expectedName)
      throw name + '@' + value + ' resolved to "' + p + '" instead of "' + expectedName + '"';
    if (deps[p] != expectedValue)
      throw name + '@' + value + ' versioned to "' + deps[p] + '" instead of "' + expectedValue + '"';
  }
}

testDependency('react', '<0.12', 'react', 'react@0.11.0');
testDependency('react', '<0.12.0', 'react', 'react@0.11.0');
testDependency('react', '~0.1.1', 'react', 'react@~0.1.1');
testDependency('react', '^0.12', 'react', 'react@^0.12');
testDependency('react', '0.12.x', 'react', 'react@~0.12.0');
testDependency('react', '0.x', 'react', 'react@0');
testDependency('react', '>=0.12.0', 'react', 'react@*');

// Scoped
testDependency('@scoped/react', '<0.12', '@scoped/react', '@scoped/react@0.11.0');
testDependency('@scoped/react', '<0.12.0', '@scoped/react', '@scoped/react@0.11.0');
testDependency('@scoped/react', '~0.1.1', '@scoped/react', '@scoped/react@~0.1.1');
testDependency('@scoped/react', '^0.12', '@scoped/react', '@scoped/react@^0.12');
testDependency('@scoped/react', '0.12.x', '@scoped/react', '@scoped/react@~0.12.0');
testDependency('@scoped/react', '0.x', '@scoped/react', '@scoped/react@0');
testDependency('@scoped/react', '>=0.12.0', '@scoped/react', '@scoped/react@*');

testDependency('get-size', '>=1.1.4 <1.3', 'get-size', 'get-size@~1.2.0');

console.log('Unit tests passed');
