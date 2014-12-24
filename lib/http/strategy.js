/**
 * The default strategy for loading HTTP resources. You can set an alternate
 * strategy with `ss.http.set({'strategy':{..}})`.
 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    connect     = require('connect'),
    serveStatic = require('../utils/serve-static'),
    fileUtils   = require('../utils/file'),
    staticUrls = {},
    staticDirs = [],
    staticFiles = [];


module.exports = {
  init: init,
  load: load,
  cookieParser: connect.cookieParser,
  favicon: connect.favicon,
  session: connect.session,
  isStatic: isStatic
};

function init() {
  return connect();
}

function load(paths,settings) {
  if (settings.compress) {
    module.exports.compressMiddleware = connect.compress();
  }
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

  if (fs.existsSync(staticPath)) {
    var files = glob.sync(staticPath + '/**/*');
    files.forEach(function(p) {
      //TODO work with formatters to determine index file names
      //TODO replace path.sep 's with '/'
      var url = path.relative(staticPath,p).replace('index.html','').replace('index.jade','');
      staticUrls['/' + url] = p;
    });

    /* Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily) */
    pathLength  = staticPath.length;
  }

  /* Ensure /assets is always present, even if the dir has yet to be created */
  if (staticDirs.indexOf('assets') === -1) {
    staticDirs.push('assets');
  }

  staticFiles = staticFiles.concat(fileUtils.readDirSync(staticPath).files);

  if (fs.existsSync(assetsPath)) {
    var files = glob.sync(assetsPath + '/**/*');
    files.forEach(function(p) {
      //TODO replace path.sep 's with '/'
      var url = path.relative(assetsPath,p);
      staticUrls['/assets/' + url] = p;
    });

  }

  return staticFiles.map(function(file) {
    return file.substr(pathLength);
  });
}

