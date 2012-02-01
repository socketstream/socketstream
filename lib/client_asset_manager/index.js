var codeWrappers, formattersByExtension, http, log, packAssetOptions, packAssets, res;

log = console.log;

http = require('http');

res = http.ServerResponse.prototype;

formattersByExtension = null;

packAssets = false;

packAssetOptions = {};

codeWrappers = {
  'libs': false,
  'modules': 'module'
};

exports.init = function(root, router, reservedNames) {
  var Client, clients, formatters, ssClient, templateEngine;
  formatters = require('./formatters').init(root);
  templateEngine = require('./template_engine').init(root);
  Client = require('./client').init(root, codeWrappers, templateEngine);
  clients = {};
  ssClient = null;
  res.serve = function(nameOrClient) {
    var client,
      _this = this;
    client = typeof nameOrClient === 'string' && clients[nameOrClient] || nameOrClient;
    if (client == null) {
      throw new Error('Unable to find single-page client: ' + nameOrClient);
    }
    return client.htmlFromCache(ssClient, formattersByExtension, packAssets, function(output) {
      _this.writeHead(200, {
        'Content-Type': 'text/html'
      });
      return _this.end(output);
    });
  };
  return {
    formatters: formatters,
    templateEngine: templateEngine,
    packAssets: function(options) {
      packAssets = true;
      return packAssetOptions = options;
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
      if (!(dirs instanceof Array)) dirs = [dirs];
      return dirs.forEach(function(dir) {
        return codeWrappers[dir] = nameOrModule;
      });
    },
    load: function(client) {
      var asset, name;
      ssClient = client;
      formattersByExtension = formatters.load();
      if (packAssets) {
        for (name in clients) {
          client = clients[name];
          client.pack(ssClient, formattersByExtension, packAssetOptions);
        }
      }
      asset = require('./asset').init(root, formattersByExtension, codeWrappers);
      return require('./serve_live').init(router, ssClient, asset, packAssets);
    }
  };
};
