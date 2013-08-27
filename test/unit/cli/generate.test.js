'use strict';

    var exec                             = require('child_process').exec,
    fs                                   = require('fs'),
    path                                 = require('path'),
    async                                = require('async'),
    generate                             = require(path.join(process.env.PWD, 'lib/cli/generate')),
    demoAppEndDir                        = 'test/results/waaa',
    demoAppPath                          = path.join(process.env.PWD, demoAppEndDir),
    program                              = {},
    logs                                 = [],
    newProjectDirectoriesThatShouldExist = [];

/**
 * Executes a child process to forcefully remove
 * a directory containing files
 *
 * @param  {String}   dirPath The path of the directory to remove
 * @param  {Function} cb      [The function to execute when finished
 * @return {Void}
 */
function removeForcefully (dirPath, cb) {
  exec('rm -rf '+ dirPath, function(err){
    cb(err);
  });
}

/**
 * Executes a child process to forcefully remove
 * a directory containing files
 *
 * @param  {String}   dirPath The path of the directory to remove
 * @param  {Function} cb      The function to execute when finished
 * @return {Void}
 */
function removeDirectoryIfExists (dirPath, cb) {
  fs.exists(dirPath, function(exists){
    if (exists) {
      removeForcefully(dirPath, cb);
    } else {
      cb();
    }
  });
}

/**
 * Hooking function for console.log interception
 * @return {function}
 */
function hookLog() {
    var _stream   = process.stdout,
        old_write = _stream.write; // Reference default write method

    /* _stream now write with our shiny function */
    _stream.write = function(string) {
      logs.push(string.replace(/\n$/, ''));
    };

    return function() {
        /* reset to the default write method */
        _stream.write = old_write;
    };
}

exports.generate = {
  setUp: function(done) {
    logs    = [];
    program = {
      args: ['new', demoAppEndDir]
    };
    newProjectDirectoriesThatShouldExist = [
      demoAppEndDir,
      path.join(demoAppPath, '/client'),
      path.join(demoAppPath, '/client/code'),
      path.join(demoAppPath, '/client/code/app'),
      path.join(demoAppPath, '/client/code/libs'),
      path.join(demoAppPath, '/client/views'),
      path.join(demoAppPath, '/client/css'),
      path.join(demoAppPath, '/client/css/libs'),
      path.join(demoAppPath, '/client/templates'),
      path.join(demoAppPath, '/client/static'),
      path.join(demoAppPath, '/client/static/images'),
      path.join(demoAppPath, '/server'),
      path.join(demoAppPath, '/server/rpc'),
      path.join(demoAppPath, '/server/middleware')
    ];

    removeDirectoryIfExists(demoAppPath, done);

  },

  tearDown: function(done) {
    removeDirectoryIfExists(demoAppPath, done);
  },

  'should generate an app inside of a folder with a unique name': function(test){
    test.expect(1);
    generate.generate(program);

    /* Using 'async' library to check if all the required project's folders are exist */
    async.reject(newProjectDirectoriesThatShouldExist, fs.exists, function(result){
      test.strictEqual( result.length, 0, 'Next required folders are not exist: "' + result.join('", "') + '"');

      test.done();
    });
  },

  'should raise an error if the name of the app matches the name of an existing folder': function(test){
    test.expect(2);

    fs.mkdir(demoAppPath, function(err) {

      var unHookLog = hookLog(); // creating a hook function for console.log
      generate.generate(program);
      unHookLog();

      test.strictEqual( logs.length, 1, "'logs' should have length === 1" );
      test.strictEqual( logs[0].toString(), "Sorry the '"+ demoAppEndDir +"' directory already exists. Please choose another name for your app.", "Error messages should be equal");
      test.done(err);
    });
  },

  'should generate an app with coffeescript files if coffeescript was requested': function (test) {
    // test.expect(0);

    // program.coffee = true;
    // generate.generate(program);

    /* Check that coffee files exist */
    test.done();
  },

  'should raise an error if no name is provided for the app': function(test) {
    test.done();
  },

  'should generate an app with jade templates if jade was requested': function(test) {
    test.done();
  },

  'should generate an app with no demo code, if a minimal app was requested': function(test) {
    test.done();
  },

  'should generate an app with the repl library, if the repl library was requested': function(test) {
    test.done();
  },
}