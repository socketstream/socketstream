/**
 * The minimal strategy for loading HTTP resources. You can set an alternate
 * strategy with `ss.http.set({'strategy':{..}})`.
 */
'use strict';

var fs = require('fs'),
  path = require('path'),
  connect     = require('connect'),
  serveStatic = require('../utils/serve-static'),
  fileUtils   = require('../utils/file'),
  staticDirs = [],
  staticFiles = [];


module.exports = {
  init: init,
  load: load,
  cookieParser: connect.cookieParser,
  favicon: connect.favicon,
  isStatic: isStatic
};

function init() {
  return connect();
}

function load(paths,settings) {
  module.exports.assetsMiddleware = serveStatic('/assets',paths.assets, settings['static']);
  module.exports.staticMiddleware = serveStatic(null,paths['static'], settings['static']);
  loadStaticDirs(paths.static, paths.assets);

  if (settings.staticCache) {
    module.exports.cacheMiddleware = connect.staticCache(settings['staticCache']);
  }
}

function isStatic(url) {
  //return staticUrls[url] !== undefined;

  var initialDir = url.split('/')[1];

  return  staticDirs.indexOf(initialDir) >= 0;
}


/**
 * Loads static directories (client/static)
 *
 * @param  {String} staticPath Path string
 * @param  {String} assetsPath Path string
 * @return {Array}       Array of all static files we know about (used to prevent connect.session from loading unnecessarily)
 */
function loadStaticDirs(staticPath,assetsPath) {
  var pathLength;

  /* Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily) */

  if (fs.existsSync(staticPath)) {
    staticDirs = staticDirs.concat(fs.readdirSync(path));

    staticFiles = staticFiles.concat(fileUtils.readDirSync(staticPath).files);
  }

  if (fs.existsSync(assetsPath)) {
    staticDirs = staticDirs.concat(fs.readdirSync(path));

    fileUtils.readDirSync(staticPath).files.forEach(function(name) {
      staticFiles.push('/assets' + name);
    });
  }

  /* Ensure /assets is always present, even if the dir has yet to be created */
  if (staticDirs.indexOf('assets') === -1) {
    staticDirs.push('assets');
  }

  return staticFiles.map(function(file) {
    return path.relative(staticPath, file);
  });
}

