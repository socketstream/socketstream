var async, moduleCache;

window.SocketStream = {
  modules: {},
  apis: {},
  transport: null,
  event: new EventEmitter2(),
  message: new EventEmitter2()
};

SocketStream.registerApi = function(name, fn) {
  var api;
  api = SocketStream.apis[name];
  if (api) {
    return console.error("SocketStream Error: Unable to register the 'ss." + name + "' responder as this name has already been taken");
  } else {
    return SocketStream.apis[name] = fn;
  }
};

moduleCache = {};

SocketStream.require = function(name, currentPath) {
  var cache, exports, mod, req;
  if (currentPath == null) currentPath = null;
  if (cache = moduleCache[name]) return cache;
  if (mod = SocketStream.modules[name]) {
    exports = {};
    req = function(name) {
      return SocketStream.require(name, mod.path);
    };
    mod.mod(exports, req);
    return moduleCache[name] = exports;
  } else {
    return console.error("SocketStream Error: Module " + name + " not found. Ensure client dirs containing modules are loaded first and that calls from one module to another are nested within functions");
  }
};

async = {
  loaded: {},
  loading: new EventEmitter2()
};

SocketStream.loadAsync = function(nameOrDir, cb) {
  var onError, onSuccess;
  if (!jQuery) {
    return console.error('SocketStream Error: loadAsync() command requires jQuery to present');
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
};

SocketStream.cookie = {
  read: function(c_name) {
    var c_end, c_start;
    if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start !== -1) {
        c_start = c_start + c_name.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end === -1) c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return '';
  },
  write: function(c_name, value, expiredays) {
    var c, exdate;
    if (expiredays == null) expiredays = null;
    exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    c = "" + c_name + "=" + (escape(value));
    return document.cookie = ("" + c_name + "=" + (escape(value))) + (expiredays === null ? "" : ";expires=" + exdate.toUTCString());
  }
};
