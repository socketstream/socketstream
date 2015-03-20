// prototype for bundlers created with ss.bundler.create(..)

var fs = require('fs'),
    path = require('path'),
    system = require('../system');

var htmlTag = {
  css: function(dests,entry) {
    var url = entry? (dests.urls.css + '?_=' + entry.file) : dests.urls.css;
    return '<link href="' + url + '" media="screen" rel="stylesheet" type="text/css">';
  },
  js: function(dests,entry) {
    var url = dests.urls.js + '?';
    switch(entry? entry.type : null) {
      case null:
        url = dests.urls.js;
        break;
      case 'loader':
        url += 'loader=-';
        break;

      case 'mod':
      case 'module':
        url += 'mod='+entry.file;
        break;

      case 'start':
        url += 'start';
        break;

      default:
        url += '_='+entry.file;
        break;
    }

    return '<script src="' + url + '" type="text/javascript"></script>';
  }
};


module.exports = function(ss, bundlers, bundlerById, options) {

  // When packing assets the default path to the CSS or JS file can be overridden
  // either with a string or a function, typically pointing to an resource on a CDN
  function resolveAssetLink(client, type) {
    var defaultPath = '/assets/' + client.name + '/' + client.id + '.' + type,
      pack = options.packedAssets,
      link = pack !== undefined ? (pack.cdn !== undefined ? pack.cdn[type] : void 0) : void 0;
    if (link) {
      if (typeof link === 'function') {
        var file = {
          id: client.id,
          name: client.name,
          extension: type,
          path: defaultPath
        };
        return link(file);
      } else if (typeof link === 'string') {
        return link;
      } else {
        throw new Error('CDN ' + type + ' param must be a Function or String');
      }
    } else {
      return defaultPath;
    }
  }

  return {
    constants: function() {
      var result = {}, k;

      // mixin system constants
      for(k in system.assets.constants) {
        result[k] = system.assets.constants[k].value;
      }

      // mixin client constants
      var client = this.client;
      if (client.constants) {
        for(k in client.constants) {
          result[k] = client.constants[k];
        }
      }

      return result;
    },

    locals: function() {
      var result = {}, k;

      // mixin system locals
      for(k in system.assets.locals) {
        result[k] = system.assets.locals[k].value;
      }

      // mixin client constants
      var client = this.client;
      if (client.locals) {
        for(k in client.locals) {
          result[k] = client.locals[k];
        }
      }

      return result;
    },

    htmlTags: function(type,pack) {
      var dests;

      if (type == 'start') {
        return ['<script>' + this.asset.start(this.client).map(function(value) { return value.content; }).join('\n') + '</script>'];
      }

      if (pack) {
        dests = { urls: {} };
        dests.urls[type] = resolveAssetLink(this.client, type);
        return [ htmlTag[type](dests) ];
      } else {
        var entries = this.asset.entries(type);
        dests = this.dests;
        return entries.map(function(entry) {
          return htmlTag[type](dests,entry);
        });
      }
    },

    // TODO: Improve to test for complete set
    //TODO: Update for new id scheme
    // Very basic check to see if we can find pre-packed assets
    determineLatestsPackedId : function() {
      try {
        var files = fs.readdirSync(path.join(ss.root, options.dirs.assets, this.client.name));
        var latestId = files.sort().pop();
        var id = latestId.split('.')[0];
        if (id.length !== 9) {
          throw 'Invalid Client ID length';
        }
        this.latestPackedId = id;
      } catch (e) {
        this.latestPackedId = false;
      }
    },

    format: function(entry, options, formatter,cb) {
      ss.bundler.format(entry,options,formatter,cb); //TODO call loadFile 'html'
    },

    clientFilePath: function(rel) {
      return ss.bundler.clientFilePath(rel);
    }
  };
};
