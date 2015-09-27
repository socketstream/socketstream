'use strict'

//TODO just load from assets folder

module.exports = function(ss,client,options){

  var bundler = ss.bundler.create({
    define: define,
    asset: asset
  });
  return bundler;


  function define(paths) {

    if (typeof paths.view !== 'string') {
      throw new Error('You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array');
    }
    if (paths.view.lastIndexOf('.') <= 0) {
      throw new Error('The \'' + paths.view + '\' view must have a valid HTML extension (such as .html or .jade)');
    }

    // Define new client object
    client.paths = ss.bundler.sourcePaths(paths);
    client.constants = paths.constants || paths.consts;
    client.locals = paths.locals;
    client.entryInitPath = ss.bundler.findEntryPoint(client);
  }

  //TODO callback(err,output) for pack to flag error
  function asset(entry, opts, cb) {
    ss.bundler.loadFile(entry, opts, null,
      function(output) {
        switch(entry.bundle) {
          case 'html':
            return cb(ss.bundler.injectTailIfNeeded(output,opts));
          case 'css':
            return cb( client.includes.css? output:'');
          case 'worker':
            //TODO
            if (opts.compress && entry.file.indexOf('.min') === -1) {
              output = ss.bundler.minifyJSFile(output, entry.file);
            }
            break;

          default:
            //TODO with options compress saved to avoid double compression
            output = bundler.wrapCode(output, entry, opts);
            if (opts.compress && entry.file.indexOf('.min') === -1) {
              output = ss.bundler.minifyJSFile(output, entry.file);
            }
            return cb(output);
        }
      },
      function(err) {
        ss.log.clientIssue(client,options,err,entry);
        switch(entry.ext) {
          case 'html':
            return cb('Couldn\'t format ' + entry.file + err.userInfoHTML);
          case 'css':
            return cb('/* couldn\'t format ' + entry.file + err.userInfoText+' */');
          default:
            return cb('// couldn\'t format ' + entry.file + err.userInfoText);
        }
      });
  }
};

