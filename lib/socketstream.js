// This file allows SocketStream to be called programatically within node
// If you're writing tests you'll want to require('socketstream') to call this file and initialize the engine

require('coffee-script');
require(__dirname + '/../lib/main.coffee').init(true);
