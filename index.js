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

// Temporary - REMOVE_BEFORE_0.3.0 - Upgrade project to new directory format introduced in 0.3 alpha3
require('colors');
var pathlib = require('path'), bar = "\n\n*************************************************************************\n\n".cyan;
if (pathlib.existsSync('server/rpc/middleware')) {
  console.log(bar +
    "Thanks for upgrading to the latest SocketStream 0.3 alpha.\nWe've decided to move the following directories\n\n" +
    "    /server/rpc/middleware to /server/middleware\n\n" +
    "    /server/rpc/actions to /server/rpc\n\n" +
    "so that websocket middleware can be used by other websocket responders (including forthcoming models).\n" +
    "Please make this change to your existing project now then restart the server. Pasting this line into a UNIX-based shell should do the trick:\n\n" +
    "    mv server/rpc/middleware server && mv server/rpc/actions/* server/rpc/ && rm -d server/rpc/actions\n" + bar);
  throw new Error("Please paste the line above into the shell then restart the server");
}

// Load SocketStream core
module.exports = require('./' + dir + '/socketstream.js');