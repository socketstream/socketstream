/**
 * The default strategy for loading HTTP resources. You can set an alternate
 * strategy with `ss.http.set({'strategy':{..}})`.
 */
'use strict';
var cookieParser = require('cookie-parser');
var connectStaticCache = require('connect-static');
var favicon = require('serve-favicon');
var expressSession = require('express-session');
var compress = require('compression');

var fs = require('fs'),
    path = require('path'),
    connect     = require('connect'),
    serveStatic = require('../utils/serve-static'),
    fileUtils   = require('../utils/file'),
    staticDirs = [],
    staticPaths = [];


module.exports = {
  init: init,
  load: load,
  cookieParser: cookieParser,
  favicon: favicon,
  session: expressSession,
  sessionCookie: {},
  isStatic: isStatic
};

function init() {
  return connect();
}

function load(paths,settings) {
  module.exports.compressMiddleware = compress();
  module.exports.assetsMiddleware = serveStatic('/assets',paths.assets, settings['static']);
  module.exports.staticMiddleware = serveStatic(null,paths['static'], settings['static']);
  loadStaticDirs(paths.static, paths.assets);

  if (settings.staticCache) {
    module.exports.cacheMiddleware = connectStaticCache(settings['staticCache']);
  }
}

function isStatic(url) {
  return staticPaths.indexOf(url) >= 0;
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
    staticDirs = staticDirs.concat(fs.readdirSync(staticPath));

    var files = fileUtils.readDirSync(staticPath).files.map(function(file) {
      return '/' + path.relative(staticPath, file).replace('index.html','');
    });

    staticPaths = staticPaths.concat(files);
  }

  if (fs.existsSync(assetsPath) && assetsPath.indexOf(staticPath) !== 0) {
    fileUtils.readDirSync(assetsPath).files.forEach(function(name) {
      staticPaths.push('/assets/' + path.relative(assetsPath, name).replace('index.html',''));
    });
  }

  /* Ensure /assets is always present, even if the dir has yet to be created */
  if (staticDirs.indexOf('assets') === -1) {
    staticDirs.push('assets');
  }

  return staticPaths;
}

