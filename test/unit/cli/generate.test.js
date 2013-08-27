'use strict';

var exec          = require('child_process').exec,
    fs            = require('fs'),
    path          = require('path'),
    generate      = require(path.join(process.env.PWD, 'lib/cli/generate')),
    demoAppEndDir = 'test/results/waaa',
    demoAppPath   = path.join(process.env.PWD, demoAppEndDir),
    program       = {},
    logs          = [];

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
    logs = [];
    program = {
      args: ['new', demoAppEndDir]
    };
    removeDirectoryIfExists(demoAppPath, done);

  },

  tearDown: function(done) {
    removeDirectoryIfExists(demoAppPath, done);
  },

  'should generate an app inside of a folder with a unique name': function(test){
    test.expect(1);
    generate.generate(program);


    fs.exists(demoAppPath, function(exist){
      test.ok(exist, "A directory that should exist does not.");
      test.done();
    });
  },

  'should raise an error if the name of the app matches the name of an existing folder': function(test){
    test.expect(2);

    fs.mkdir(demoAppPath, function(err) {

      var unHookLog = hookLog(); // creating un hook function for console.log
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