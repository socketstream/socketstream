var persistantStore;

persistantStore = false;

exports.use = function(nameOrModule, config) {
  if (config == null) config = {};
  return persistantStore = (function() {
    if (typeof nameOrModule === 'object') {
      return nameOrModule;
    } else {
      try {
        return require("./persistent_stores/" + nameOrModule).init(config);
      } catch (e) {
        throw new Error("Unable to find the '" + nameOrModule + "' persistent session store internally. Please pass a module");
      }
    }
  })();
};

exports.lookup = function(sessionId, cb) {
  if (persistantStore) {
    return persistantStore.lookup(sessionId, function(obj) {
      return cb(obj);
    });
  } else {
    return cb(false);
  }
};

exports.Store = (function() {

  function Store(id) {
    this.id = id;
    this.userId = null;
    this.channels = [];
  }

  Store.prototype.save = function(cb) {
    if (persistantStore) {
      return persistantStore.store(this.id, this, cb);
    } else {
      return cb(this);
    }
  };

  return Store;

})();
