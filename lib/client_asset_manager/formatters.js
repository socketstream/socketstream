var mods;

mods = [];

exports.init = function(root) {
  return {
    load: function() {
      var formatters;
      this.add('javascript');
      this.add('css');
      this.add('html');
      formatters = {};
      mods.forEach(function(mod) {
        return mod.extensions.forEach(function(extension) {
          return formatters[extension] = mod;
        });
      });
      return formatters;
    },
    add: function(nameOrModule, config) {
      var formatter, mod;
      if (config == null) config = {};
      mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          try {
            return require("./formatters/" + nameOrModule);
          } catch (e) {
            throw new Error("The " + nameOrModule + " formatter is not supported by SocketStream. Please pass a compatible module instead");
          }
        }
      })();
      formatter = mod.init(root, config);
      return mods.push(formatter);
    }
  };
};
