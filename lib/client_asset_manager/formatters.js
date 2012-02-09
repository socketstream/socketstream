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
      var formatter, mod, modPath;
      if (config == null) config = {};
      mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          modPath = "./formatters/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error("The " + nameOrModule + " formatter is not supported by SocketStream internally. Please pass a compatible module instead");
          }
        }
      })();
      formatter = mod.init(root, config);
      return mods.push(formatter);
    }
  };
};
