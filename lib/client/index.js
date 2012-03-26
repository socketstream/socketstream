var clients, formatters, log, packAssets, settings, system, templateEngine;

log = console.log;

system = require('./system');

templateEngine = require('./template_engine');

formatters = require('./formatters');

packAssets = false;

settings = {
  packAssets: {},
  liveReload: ['code', 'css', 'static', 'templates', 'views']
};

clients = {};

exports.init = function(root, router, reservedNames) {
  var http;
  http = require('./http').init(root, clients);
  system.load();
  return {
    formatters: formatters.init(root),
    templateEngine: templateEngine.init(root),
    assets: system,
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
      var _this = this;
      if (clients[name] != null) {
        throw new Error("Client name '" + name + "' has already been defined");
      }
      if (reservedNames.indexOf(name) === 0) {
        throw new Error("Client name '" + name + "' conflicts with a directory or file name in /client/static");
      }
      if (typeof paths.view !== 'string') {
        throw new Error("You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array");
      }
      if (paths.view.indexOf('.') === -1) {
        throw new Error("The '" + paths.view + "' view must have a valid HTML extension (such as .html or .jade)");
      }
      if (paths.templates) paths.tmpl = paths.templates;
      ['css', 'code', 'tmpl'].forEach(function(assetType) {
        if (!(paths[assetType] instanceof Array)) {
          return paths[assetType] = [paths[assetType]];
        }
      });
      return clients[name] = {
        id: Number(Date.now()),
        name: name,
        paths: paths
      };
    },
    load: function(ss) {
      var client, name, pack;
      formatters.load();
      system.add('code', 'init', "require('/entry'); require('socketstream').connect();");
      if (packAssets) {
        pack = require('./pack');
        for (name in clients) {
          client = clients[name];
          pack(root, client, settings.packAssets);
        }
      } else {
        require('./serve/dev')(root, router);
        if (settings.liveReload) {
          require('./live_reload')(root, settings.liveReload, ss);
        }
      }
      return require('./serve/ondemand')(root, router, packAssets);
    }
  };
};
