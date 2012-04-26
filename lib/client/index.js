var clients, formatters, log, options, packAssets, systemAssets, templateEngine;

log = console.log;

systemAssets = require('./system');

templateEngine = require('./template_engine');

formatters = require('./formatters');

packAssets = false;

options = {
  packAssets: {},
  liveReload: ['code', 'css', 'static', 'templates', 'views'],
  dirs: {
    code: '/client/code',
    css: '/client/css',
    static: '/client/static',
    assets: '/client/static/assets',
    templates: '/client/templates',
    views: '/client/views',
    workers: '/client/workers'
  }
};

clients = {};

module.exports = function(ss, router) {
  var http;
  http = require('./http')(ss.root, clients, options);
  systemAssets.load();
  ss.client = {
    send: systemAssets.send
  };
  return {
    formatters: formatters.init(ss.root),
    templateEngine: templateEngine.init(ss, options),
    assets: systemAssets,
    options: options,
    set: function(newOption) {
      var k, v, x, y, _results;
      if (typeof newOption !== 'object') {
        throw new Error('ss.client.set() takes an object e.g. {liveReload: false}');
      }
      _results = [];
      for (k in newOption) {
        v = newOption[k];
        if (v instanceof Object) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (x in v) {
              y = v[x];
              _results2.push(options[k][x] = y);
            }
            return _results2;
          })());
        } else {
          _results.push(options[k] = v);
        }
      }
      return _results;
    },
    packAssets: function(opts) {
      packAssets = true;
      return options.packAssets = opts;
    },
    define: function(name, paths) {
      var _this = this;
      if (clients[name] != null) {
        throw new Error("Client name '" + name + "' has already been defined");
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
      systemAssets.send('code', 'init', "require('/entry'); require('socketstream').connect();");
      if (packAssets) {
        pack = require('./pack');
        for (name in clients) {
          client = clients[name];
          pack(ss.root, client, options);
        }
      } else {
        require('./serve/dev')(ss.root, router, options);
        if (options.liveReload) require('./live_reload')(ss.root, options, ss);
      }
      return require('./serve/ondemand')(ss.root, router, options);
    }
  };
};
