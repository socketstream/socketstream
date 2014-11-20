var fs = require('fs'),
    log = require('../../utils/log'),
    cleanCSS = require('clean-css'),
    system = require('../system'),
    view = require('../view');

var bundlers = {}; // get bundler by client name

/**
 * Define the bundler for a client
 * @param client object to store the definition in
 * @param args arguments passed to define
 */
exports.define = function defineBundler(ss,client,args,options) {

  var name = args[0], 
      pathsOrFunc = args[1];

  if (typeof pathsOrFunc === "function") {
    bundlers[name] = pathsOrFunc(ss,options);
    bundlers[name].define(client, args[2], args[3], args[4], args[5]);
  } else {
    bundlers[name] = require('./default')(ss,client,options);
    bundlers[name].define(args[1]);
  }
};

/**
 * Determine the bundler for a client
 * @param client Query params with client=name or an actual client object
 */
function getBundler(ss,client,options){

  if (client.bundler) return client.bundler;

  if (typeof client.client === "string") {
    return bundlers[client.client];
  }
  if (typeof client.name === "string") {
    return bundlers[client.name];
  }

  throw new Error('Unknow client '+(client.name || client.client) );
}

exports.get = getBundler;

exports.load = function() {
  for(var n in bundlers) bundlers[n].load();
};

exports.pack = function pack(ss, client, options) {
  client.pack = true;

  // the concrete bundler for the client
  var bundler = getBundler(ss, client, options);

  /* PACKER */

  log(('Pre-packing and minifying the \'' + client.name + '\' client...').yellow);
  
  bundler.ensureAssetFolder();

  // Output CSS  
  bundler.pack.css(function(files) {
    var minified, original;
    original = files.join('\n');
    minified = cleanCSS.process(original);
    log.info(('  Minified CSS from ' + (formatKb(original.length)) + ' to ' + (formatKb(minified.length))).grey);
    return minified;
  });

  // Output JS  
  bundler.pack.js(function(files) {
    var parts = [];
    if (client.includes.system) {
      parts.push( system.serve.js({ compress:true }) );
    }
    parts = parts.concat(files);
    if (client.includes.initCode) {
      parts.push( system.serve.initCode() );
    }

    return parts.join(";");
  });

  // Output HTML view  
  return view(ss, client, options, function(html) {
    fs.writeFileSync(bundler.description.paths.html, html);
    return log.info('✓'.green, 'Created and cached HTML file ' + bundler.description.relPaths.html);
  });
};

// PRIVATE

function formatKb(size) {
  return '' + (Math.round((size / 1024) * 1000) / 1000) + ' KB';
}
