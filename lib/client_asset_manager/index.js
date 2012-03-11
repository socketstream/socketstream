var formattersByExtension, http, initAppCode, log, packAssets, res, settings;

log = console.log;

http = require('http');

res = http.ServerResponse.prototype;

formattersByExtension = null;

packAssets = false;

settings = {
  packAssets: {},
  liveReload: true
};

initAppCode = "require('/entry'); require('socketstream').connect();";

exports.init = function(root, router, reservedNames) {
  var Client, clients, formatters, ssClient, templateEngine;
  formatters = require('./formatters').init(root);
  templateEngine = require('./template_engine').init(root);
  Client = require('./client').init(root, templateEngine, initAppCode);
  clients = {};
  ssClient = null;
  res.serveClient = function(nameOrClient) {
    var client,
      _this = this;
    client = typeof nameOrClient === 'string' && clients[nameOrClient] || nameOrClient;
    if (client == null) {
      throw new Error('Unable to find single-page client: ' + nameOrClient);
    }
    return client.htmlFromCache(ssClient, formattersByExtension, packAssets, function(output) {
      _this.writeHead(200, {
        'Content-Length': Buffer.byteLength(output),
        'Content-Type': 'text/html'
      });
      return _this.end(output);
    });
  };
  res.serve = res.serveClient;
  return {
    formatters: formatters,
    templateEngine: templateEngine,
    set: function(newSettings) {
      var k, v, _results;
      if (typeof newSettings !== 'object') {
        throw new Error('ss.client.set() takes an object e.g. {liveReload: false}');
      }
      _results = [];
      for (k in newSettings) {
        v = newSettings[k];
        _results.push(settings[k] = v);
      }
      return _results;
    },
    packAssets: function(options) {
      packAssets = true;
      return settings.packAssets = options;
    },
    define: function(name, paths) {
      var client;
      if (clients[name] != null) {
        throw new Error("Client name '" + name + "' has already been defined");
      }
      if (reservedNames.indexOf(name) === 0) {
        throw new Error("Client name '" + name + "' conflicts with a directory or file name in /client/static");
      }
      client = new Client(name, paths, packAssets);
      clients[name] = client;
      return client;
    },
    wrapCode: function(nameOrModule, dirs) {
      throw new Error("Thanks for upgrading to the latest alpha. The ss.client.wrapCode() command has now been deprecated as every file not in /client/code/libs is now assumed to be a module. Please remove calls to ss.client.wrapCode() in your app and restart SocketStream\n\n");
    },
    load: function(client, ss) {
      var asset, name;
      ssClient = client;
      formattersByExtension = formatters.load();
      if (packAssets) {
        for (name in clients) {
          client = clients[name];
          client.pack(ssClient, formattersByExtension, settings.packAssets);
        }
      } else {
        if (settings.liveReload) require('./live_reload').init(root, ss);
      }
      asset = require('./asset').init(root, formattersByExtension);
      return require('./serve_live').init(router, ssClient, asset, initAppCode, packAssets);
    }
  };
};
