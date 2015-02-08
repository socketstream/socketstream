// Client Views
// ------------
// Generates HTML output for each single-page view 
'use strict';

var pathlib = require('path'),
    magicPath = require('./magic_path');

module.exports = function(ss, client, options, cb) {
  var templateEngine = require('./template_engine')(ss),
      bundler = ss.bundler.get(client);

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
  }

  function templates() {
    var dir = pathlib.join(ss.root, options.dirs.client);
    var output = [];
    if (client.paths.tmpl) {
      var files = [];
      client.paths.tmpl.forEach(function(tmpl) {
        if (tmpl.substring(tmpl.length-2) == '/*') {
          var matching = magicPath.files(pathlib.join(dir,tmpl.substring(0,tmpl.length-2)), '*');
          files = files.concat(matching.map(function(p) { return pathlib.join(tmpl.substring(0,tmpl.length-2),p); }));
        }
        else {
          files = files.concat(magicPath.files(dir, tmpl));
        }
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
      output.push(ss.bundler.htmlTag.css(css));
      output.push(ss.bundler.htmlTag.js(js));
    } else {
      // Otherwise, in development, list all files individually so debugging is easier

      // SocketStream system libs and modules
      if (client.includes.system) {
        output.push(ss.bundler.htmlTag.js('/_serveDev/system?ts=' + client.id));
      }

      // Send all CSS
      if (client.includes.css) {
        output = output.concat( bundler.asset.entries('css')
          .map(function(entry) { return ss.bundler.htmlTag.css('/_serverDev/css/' + entry.file + '?ts=' + client.id + '&client=' + client.name); }) );
      }

      // Send Application Code
      output = output.concat( bundler.asset.entries('js')
        .map(function(entry) { return ss.bundler.htmlTag.js('/_serverDev/code/' + entry.file + '?ts=' + client.id + '&client=' + client.name); }) );

      // Start your app and connect to SocketStream
      if (client.includes.initCode) {
        output.push(ss.bundler.htmlTag.js('/_serveDev/start?ts=' + client.id));
      }
    }
    return output;
  }

  // Add links to CSS and JS files
  var includes = headers().concat(templates());

  // Output HTML
  var htmlOptions = {
    headers: includes.join(''),
    compress: options.packedAssets,
    filename: client.paths.view
  };
  return bundler.asset.html(client.paths.view, htmlOptions, cb);
};
