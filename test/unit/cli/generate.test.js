'use strict';

var exec      = require('child_process').exec,
    fs        = require('fs'),
    path      = require('path'),
    assert    = require('assert'),
    generate  = require(path.join(process.env.PWD, 'lib/cli/generate'));



// Executes a child process to forcefully remove 
// a directory containing files
//
// @param   dirPath   {String}    The path of the directory to remove
// @param   cb        {Function}  The function to execute when finished      
//
function removeForcefully (dirPath, cb) {
  exec('rm -rf '+ dirPath, function(err){
    cb(err);
  });
}



// Executes a child process to forcefully remove 
// a directory containing files
//
// @param   dirPath   {String}    The path of the directory to remove
// @param   cb        {Function}  The function to execute when finished      
//
function removeDirectoryIfExists (dirPath, cb) {
  fs.exists(dirPath, function(exists){
    exists ? removeForcefully(dirPath, cb) : cb();
  });
}



describe('generate', function() {



  beforeEach(function(done){
    var demoAppPath = process.env.PWD+'/waaa';
    removeDirectoryIfExists(demoAppPath, done);
  });



  afterEach(function(done){
    var demoAppPath = process.env.PWD+'/waaa';
    removeDirectoryIfExists(demoAppPath, done);
  });



  it('should generate an app inside of a folder with a unique name', function(done){
    var program = {
      args: ['new', 'waaa']
    };
    generate.generate(program);
    fs.exists(process.env.PWD+'/waaa', function(exist){
      assert(exist, "A directory that should exist does not.");
      done();
    });
  });



  // it('should raise an error if the name of the app matches the name of an existing folder', function(done){
  //   fs.mkdir(process.env.PWD+'/waaa', function(err) {

  //     var program = {
  //       args: ['new', 'waaa']
  //     };

  //     generate.generate(program);

  //     // TODO - figure out how to check that it raised an error

  //   });
  // });



  it('should raise an error if no name is provided for the app');



  it('should generate an app with coffeescript files if coffeescript was requested', function (done) {
    var program = {
      args    : ['new', 'waaa'],
      coffee  : true
    };
    generate.generate(program);
    // Check that coffee files exist
    done();
  });



  it('should generate an app with jade templates if jade was requested');

  it('should generate an app with no demo code, if a minimal app was requested');

  it('should generate an app with the repl library, if the repl library was requested');

});