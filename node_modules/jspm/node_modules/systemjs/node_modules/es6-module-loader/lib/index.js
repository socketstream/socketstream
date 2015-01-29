if (!global.traceur)
  require('traceur');
require('../dist/es6-module-loader-sans-promises.src');

module.exports = {
  Loader: global.LoaderPolyfill,
  System: global.System
};
