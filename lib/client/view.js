// Client Views
// ------------
// Generates HTML output for each single-page view
'use strict';

var path = require('path'),
    magicPath = require('./magic_path');

module.exports = function(ss, client, options, cb) {
  var templateEngine = require('./template_engine')(ss),
      bundler = ss.bundler.get(client);

  function templates() {
    var dir = path.join(ss.root, options.dirs.client);
    var output = [];
    if (client.paths.tmpl) {
      var files = [];
      client.paths.tmpl.forEach(function(tmpl) {
        if (tmpl.substring(tmpl.length-2) === '/*') {
          var matching = magicPath.files(path.join(dir,tmpl.substring(0,tmpl.length-2)), '*');
          files = files.concat(matching.map(function(p) { return path.join(tmpl.substring(0,tmpl.length-2),p); }));
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
    // Return an array of headers. Order is important!
    var output = [];

    // Send all CSS
    if (client.includes.css) {
      output = output.concat( bundler.htmlTags('css',!!options.packedAssets) );
    }

    // Send Application Code
    output = output.concat( bundler.htmlTags('js',!!options.packedAssets) );

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
