// Client Views
// ------------
// Generates HTML output for each single-page view 
'use strict';

var pathlib = require('path'),
    magicPath = require('./magic_path'),
    wrap = require('./wrap');

module.exports = function(ss, client, options, cb) {
  var templateEngine = require('./template_engine')(ss),
      bundler = require('./bundler/index').get(ss, client, options);

  // Add links to CSS and JS files
  var includes = headers().concat(templates());

  // Output HTML
  var htmlOptions = {
    headers: includes.join(''),
    compress: options.packedAssets,
    filename: client.paths.view
  };
  return bundler.asset.html(client.paths.client, htmlOptions, cb);

  // When packing assets the default path to the CSS or JS file can be overridden
  // either with a string or a function, typically pointing to an resource on a CDN  
  function resolveAssetLink(type) {
    var defaultPath, file, link, _ref, _ref1;
    defaultPath = '/assets/' + client.name + '/' + client.id + '.' + type;
    if (link = (_ref = options.packedAssets) !== undefined ? (_ref1 = _ref.cdn) !== undefined ? _ref1[type] : void 0 : void 0) {
      if (typeof link === 'function') {
        var file = {
          id: client.id,
          name: client.name,
          extension: type,
          path: defaultPath
        };
        return link(file);
      } else if (typeof link === 'string') {
        return link;
      } else {
        throw new Error('CDN ' + type + ' param must be a Function or String');
      }
    } else {
      return defaultPath;
    }
  };
  templates = function() {
    var dir, files, output;
    dir = pathlib.join(ss.root, options.dirs.templates);
    output = [];
    if (client.paths.tmpl) {
      files = [];
      client.paths.tmpl.forEach(function(tmpl) {
        files = files.concat(magicPath.files(dir, tmpl));
      });
      templateEngine.generate(dir, files, function(templateHTML) {
        return output.push(templateHTML);
      });
    }
    return output;
  }

  function headers() {
    var css, js, output;

    // Return an array of headers. Order is important!    
    output = [];

    // If assets are packed, we only need one CSS and one JS file
    if (options.packedAssets) {
      css = resolveAssetLink('css');
      js = resolveAssetLink('js');
      output.push(wrap.htmlTag.css(css));
      output.push(wrap.htmlTag.js(js));
    } else {

      // Otherwise, in development, list all files individually so debugging is easier      

      // SocketStream system libs and modules
      if (client.includes.system) {
        output.push(wrap.htmlTag.js('/_serveDev/system?ts=' + client.id));
      }

      // Send all CSS
      if (client.includes.css) {
        client.paths.css.forEach(function(path) {
          return magicPath.files(pathlib.join(ss.root, options.dirs.client), path).forEach(function(file) {
            return output.push(wrap.htmlTag.css('/_serveDev/css/' + file + '?ts=' + client.id + '&client=' + client.name));
          });
        });
      }

      // Send Application Code      
      client.paths.code.forEach(function(path) {
        return magicPath.files(pathlib.join(ss.root, options.dirs.client), path).forEach(function(file) {
          var url = '/_serveDev/code/' + file + '?ts=' + client.id + '&client=' + client.name;
          if (! options.globalModules) url += '&pathPrefix=' + path;
          return output.push(wrap.htmlTag.js(url));
        });
      });

      // Start your app and connect to SocketStream     
      if (client.includes.initCode) {
        output.push(wrap.htmlTag.js('/_serveDev/start?ts=' + client.id));
      }
    }
    return output;
  }
};
