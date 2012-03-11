var EventEmitter2, async, message, server, transport;

EventEmitter2 = require('eventemitter2').EventEmitter2;

transport = require('socketstream-transport');

server = exports.server = new EventEmitter2;

message = exports.message = new EventEmitter2;

exports.registerApi = function(name, fn) {
  var api;
  api = exports[name];
  if (api) {
    return console.error("SocketStream Error: Unable to register the 'ss." + name + "' responder as this name has already been taken");
  } else {
    return exports[name] = fn;
  }
};

exports.connect = function(fn) {
  return exports.send = transport(server, message).connect();
};

async = {
  loaded: {},
  loading: new EventEmitter2
};

exports.load = {
  code: function(nameOrDir, cb) {
    var errorPrefix, onError, onSuccess;
    if (nameOrDir && nameOrDir.substr(0, 1) === '/') {
      nameOrDir = nameOrDir.substr(1);
    }
    errorPrefix = 'SocketStream Error: The ss.load.code() command ';
    if (!jQuery) {
      return console.error(errorPrefix + 'requires jQuery to be present');
    }
    if (!nameOrDir) {
      return console.error(errorPrefix + 'requires a directory to load. Specify it as the first argument. E.g. The ss.load.code(\'/mail\',cb) will load code in /client/code/mail');
    }
    if (!cb) {
      return console.error(errorPrefix + 'requires a callback. Specify it as the last argument');
    }
    if (async.loaded[nameOrDir]) return cb();
    async.loading.once(nameOrDir, cb);
    if (async.loading.listeners(nameOrDir).length === 1) {
      onError = function() {
        console.error('SocketStream Error: Could not asynchronously load ' + nameOrDir);
        return console.log(arguments);
      };
      onSuccess = function() {
        async.loaded[nameOrDir] = true;
        return async.loading.emit(nameOrDir);
      };
      return $.ajax({
        url: "/_serveAsync/code?" + nameOrDir,
        type: 'GET',
        cache: false,
        dataType: 'script',
        success: onSuccess,
        error: onError
      });
    }
  }
};

server.on('__ss:reload', function() {
  console.log('Reloading as files have changed...');
  return window.location.reload();
});
