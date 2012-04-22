// Initial entry point. Decides which directory of code to load

var dir;

// SocketStream core developers, start your app with SS_DEV=1 to run the CoffeeScript /src code at runtime
if (process.env['SS_DEV']) {
  dir = 'src';
  console.log("Running CoffeeScript code in /src for SocketStream core developers\nType 'make build' in the socketstream project directory to re-generate /lib when done")
  require('coffee-script');
} else {
  dir = 'lib';
}

// Load SocketStream core
module.exports = require('./' + dir + '/socketstream.js');