// Code Formatters
// ---------------
// Loads default code formatters and presents an API for loading custom formatters
'use strict';

module.exports = function(ss) {
  var mods;
  mods = [];
  return {
    add: function(nameOrModule, config) {
      var formatter, mod, modPath;
      if (!config) {
        config = {};
      }
      mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          modPath = './formatters/' + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error('The ' + nameOrModule + ' formatter is not supported by SocketStream internally. Please pass a compatible module instead');
          }
        }
      })();
      formatter = mod.init(ss.root, config);
      return mods.push(formatter);
    },
    load: function() {
      var byExtension = {};
      mods.forEach(function (mod) {
        return mod.extensions.forEach(function (extension) {
          byExtension[extension] = mod;
        });
      });
      return byExtension;
    }
  };
};