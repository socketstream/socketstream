var mods;

mods = [];

exports.byExtension = {};

exports.init = function(root) {
  var add;
  add = function(nameOrModule, config) {
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
  };
  add('javascript');
  add('css');
  add('html');
  /* RETURN API
  */
  return {
    add: add
  };
};

exports.load = function() {
  return mods.forEach(function(mod) {
    return mod.extensions.forEach(function(extension) {
      return exports.byExtension[extension] = mod;
    });
  });
};
