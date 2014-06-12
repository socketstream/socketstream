// Client Views
// ------------
// Generates HTML output for each single-page view 

var magicPath, pathlib, wrap;

pathlib = require('path');

magicPath = require('./magic_path');

wrap = require('./wrap');

module.exports = function(ss, client, options, cb) {
  var asset, headers, htmlOptions, includes, resolveAssetLink, templateEngine, templates;
  templateEngine = require('./template_engine')(ss);

  // When packing assets the default path to the CSS or JS file can be overridden 
  // either with a string or a function, typically pointing to an resource on a CDN  
  resolveAssetLink = function(type) {
    var defaultPath, file, link, _ref, _ref1;
    defaultPath = "/assets/" + client.name + "/" + client.id + "." + type;
    if (link = (_ref = options.packedAssets) != null ? (_ref1 = _ref.cdn) != null ? _ref1[type] : void 0 : void 0) {
      if (typeof link === 'function') {
        file = {
          id: client.id,
          name: client.name,
          extension: type,
          path: defaultPath
        };
        return link(file);
      } else if (typeof link === 'string') {
        return link;
      } else {
        throw new Error("CDN " + type + " param must be a Function or String");
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
        return files = files.concat(magicPath.files(dir, tmpl));
      });
      templateEngine.generate(dir, files, function(templateHTML) {
        return output.push(templateHTML);
      });
    }
    return output;
  };
  headers = function() {
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
      output.push(wrap.htmlTag.js("/_serveDev/system?ts=" + client.id));

      // Send all CSS
      client.paths.css.forEach(function(path) {
        return magicPath.files(pathlib.join(ss.root, options.dirs.css), path).forEach(function(file) {
          return output.push(wrap.htmlTag.css("/_serveDev/css/" + file + "?ts=" + client.id));
        });
      });

      // Send Application Code      
      client.paths.code.forEach(function(path) {
        return magicPath.files(pathlib.join(ss.root, options.dirs.code), path).forEach(function(file) {
          return output.push(wrap.htmlTag.js("/_serveDev/code/" + file + "?ts=" + client.id + "&pathPrefix=" + path));
        });
      });

      // Start your app and connect to SocketStream      
      output.push(wrap.htmlTag.js("/_serveDev/start?ts=" + client.id));
    }
    return output;
  };

  // Init

  asset = require('./asset')(ss, options);

  // Add links to CSS and JS files  
  includes = headers();
  includes = includes.concat(templates());
  
  // Output HTML
  htmlOptions = {
    headers: includes.join(''),
    compress: options.packedAssets,
    filename: client.paths.view
  };
  return asset.html(client.paths.view, htmlOptions, cb);
};
