// Client Views
// ------------
// Generates HTML output for each single-page view
'use strict';

module.exports = function(ss, client, options, cb) {
  var templateEngine = require('./template_engine')(ss, options), //TODO why not use the one in client/index ?
      bundler = ss.bundler.get(client);

  function templates() {
    var files = bundler.entries('tmpl'),
        output = [];
    templateEngine.generate(bundler, files, function(html) {
      return output.push(html);
    });
    return output;
  }

  function headers() {
    // Return an array of headers. Order is important!
    var output = [];

    // Send all CSS
    if (client.includes.css) {
      output = output.concat( bundler.htmlTags('css',!!client.pack) );
    }

    // Send Application Code
    output = output.concat( bundler.htmlTags('js',!!client.pack) );

    return output;
  }

  // Add links to CSS and JS files
  var includes = headers().concat(templates());

  // In future constants might be placed at beginning of headers
  var start = bundler.htmlTags('start');
  if (options.startInBundle) {
    includes = includes.concat(start);
    start = [];
  }

  // Output HTML
  var htmlOptions = {
    constants: bundler.constants(),
    locals: bundler.locals(),
    headers: includes.join(''),
    tail: start.join(''),
    compress: options.packedAssets,
    filename: client.paths.view
  };
  return bundler.asset(bundler.entryFor('html',client.paths.view), htmlOptions, cb);
};
