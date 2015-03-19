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
      var formatter;
      config = config || {};
      switch(typeof nameOrModule) {
        case 'object':
          formatter = nameOrModule.init(ss.root, config, options);
          addCall(formatter);
          break;

        case 'function':
          formatter = nameOrModule(ss, config, options);
          addCall(formatter,true);
          break;
        case 'string':
          var modPath = './formatters/' + nameOrModule;
          if (!require.resolve(modPath)) {
            throw new Error('The ' + nameOrModule + ' formatter is not supported by SocketStream internally. Please pass a compatible module instead');
          }
          var mod = require(modPath);
          formatter = mod(ss, config, options);
          addCall(formatter,true);
          break;
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

  function addCall(formatter) {
    formatter.call = function(path,options,cb,errCb) {
      try{
        formatter.compile(path,options,function(result) {
          if (typeof result === 'string') { return cb(result); }
          else { return errCb(result); }
        },errCb);
      }
      catch(ex) {
        return errCb(ex);
      }
    };
  }
};
