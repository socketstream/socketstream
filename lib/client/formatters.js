// Code Formatters
// ---------------
// Loads default code formatters and presents an API for loading custom formatters
'use strict';


/**
 * @ngdoc service
 * @name ss.client.formatters:formatters
 * @description
 * Formatter registry
 */
module.exports = function(ss,options) {
  var mods = [];
  return {
    /**
     * @ngdoc method
     * @name ss.client.formatters:formatters#add
     * @methodOf ss.client.formatters:formatters
     * @function
     * Define a formatter for client asset (JS/CSS/HTML) rendering
     * @param {string|object} nameOrModule the formatter object or name
     * @param {object} config parameters configuring the formatter
     */
    add: function(nameOrModule, config) {
      var mod, formatter;
      config = config || {};
      if (typeof nameOrModule === 'object') {
        mod = nameOrModule;
      } else {
        var modPath = './formatters/' + nameOrModule;
        if (require.resolve(modPath)) {
          mod = require(modPath);
        } else {
          throw new Error('The ' + nameOrModule + ' formatter is not supported by SocketStream internally. Please pass a compatible module instead');
        }
      }
      if (typeof mod === 'function') {
        formatter = mod(ss, config, options);
      } else if (mod.newAPI) {
        formatter = mod.init(ss, config, options);
      } else {
        formatter = mod.init(ss.root, config, options);
      }
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
