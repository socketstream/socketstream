// Temporary code to update existing 0.3 alpha projects
// REMOVE_BEFORE_0.3.0

require('colors');

var pathlib = require('path')
  , bar = "\n\n*************************************************************************\n\n".cyan;

// Upgrade project to new directory format introduced in 0.3 alpha3
if (pathlib.existsSync('server/rpc/middleware')) {
  console.log(bar +
    "Thanks for upgrading to the latest SocketStream 0.3 alpha.\nWe've decided to move the following directories\n\n" +
    "    /server/rpc/middleware to /server/middleware\n\n" +
    "    /server/rpc/actions to /server/rpc\n\n" +
    "so that websocket middleware can be used by other websocket responders (including forthcoming models).\n" +
    "Please make this change to your existing project now then restart the server. Pasting this line into a UNIX-based shell should do the trick:\n\n" +
    "    mv server/rpc/middleware server && mv server/rpc/actions/* server/rpc/ && rm -fr server/rpc/actions\n" + bar);
  throw new Error("Please paste the line above into the shell then restart the server");
}

// Delete 'console.js' file if it exists (no longer needed from 0.3 alpha4)
if (pathlib.existsSync('console.js')) require('fs').unlinkSync('console.js');

// Notify of changes to client code when upgrading to 0.3 alpha5
if (pathlib.existsSync('client/code/modules')) {
  console.log(bar +
    "Thanks for upgrading to the latest SocketStream 0.3 alpha.\n\n" +
    "We've made some major improvements to client-side code which will require\na few changes on your part. Please read:\n\n" +
    "https://github.com/socketstream/socketstream/blob/master/doc/guide/en/client_side_code.md\n\n".yellow +
    "then generate a new project to see the new format.\n\n" +
    "This message will go away when /client/code/modules has been renamed to\nsomething else (we suggest 'app') so we know you've upgraded your code" + bar);
  throw new Error("Please update your /client/code with the latest changes (see above)");
}