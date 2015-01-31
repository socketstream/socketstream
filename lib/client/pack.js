// Asset Packer
// ------------
// Packs all CSS, JS and HTML assets declared in the ss.client.define() call to be sent upon initial connection
// Other code modules can still be served asynchronously later on
'use strict';

require('colors');

var fs = require('fs'),
  pathlib = require('path'),
  cleanCSS = require('clean-css'),
  magicPath = require('./magic_path'),
  system = require('./system'),
  view = require('./view'),
  log = require('../utils/log');

module.exports = function(ss, client, options) {
  var bundler = require('./bundler/index').get(ss, client, options);
  var clientDir, containerDir; //TODO
  client.pack = true;

  /* PACKER */

  log(('Pre-packing and minifying the \'' + client.name + '\' client...').yellow);

  var description = ss.client.describeAssets(client.name);

  // Prepare folder
  description.ensureDirs();
  if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
    deleteOldFiles(description.dir);
  }

  // Output CSS  
  bundler.packCSS(client, function(files) {
    var minified, original;
    original = files.join('\n');
    minified = cleanCSS.process(original);
    log.info(('  Minified CSS from ' + (formatKb(original.length)) + ' to ' + (formatKb(minified.length))).grey);
    return minified;
  });

  // Output JS  
  bundler.packJS(client, function(files) {
    var parts = [];
    if (client.includes.system) {
      parts.push( system.serve.js({ compress:true }) );
    }
    parts = parts.concat(files);
    if (client.includes.initCode) {
      parts.push( system.serve.initCode() );
    }

    return parts.join(';');
  });

  // Output HTML view  
  return view(ss, client, options, function(html) {
    var fileName;
    fileName = pathlib.join(clientDir, client.id + '.html');
    fs.writeFileSync(fileName, html);
    return log.info('✓'.green, 'Created and cached HTML file ' + fileName.substr(ss.root.length));
  });
};

// PRIVATE

function formatKb(size) {
  return '' + (Math.round((size / 1024) * 1000) / 1000) + ' KB';
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
}

function deleteOldFiles(clientDir) {
  var filesDeleted, numFilesDeleted;
  numFilesDeleted = 0;
  filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
    return fs.unlinkSync(pathlib.join(clientDir, fileName));
  });
  return filesDeleted.length > 1 && log('✓'.green, '' + filesDeleted.length + ' previous packaged files deleted');
}
