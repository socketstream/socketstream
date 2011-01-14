// TODO: Extract config to seperate file ala Rails

require('./globals');

exports.init = function(root_dir) {
  SocketStream.root = root_dir;
  SocketStream.config = {
    port: 3000,
    serve_static: true,
    log_level: 3
  };
  return this;
};

exports.start = function(root_dir) {
  
  var Server = require('./server.coffee').Server;
  
  if (NODE_ENV != 'production') {
    var Packer = require('./packer.coffee').Packer
    var packer = new Packer
    if (NODE_ENV == 'development')  packer.developerMode()
    if (NODE_ENV == 'staging')      packer.pack()
  };

  server = new Server();
  server.start();
};
