/*jshint expr:true */

"use strict";

var fs         = require('fs'),
    path       = require('path'),
    should     = require('should'),
    fileUtils  = require( path.join(process.env.PWD, 'lib/utils/file') ),
    projectDir = path.join(process.env.PWD, 'test/fixtures/project'),
    testDir    = path.join(process.env.PWD, 'test/fixtures/files');

exports.isDir = {
  'should return true for directories': function(test) {
    test.expect(2);
    test.strictEqual( fileUtils.isDir(projectDir), true );
    test.strictEqual( fileUtils.isDir(projectDir + "/client"), true );
    test.done();
  },

  'should return false for non-directories': function(test) {
    test.expect(2);
    test.strictEqual( fileUtils.isDir(projectDir + "/app.js"), false );
    test.strictEqual( fileUtils.isDir(projectDir + "/client/views/main.jade"), false );

    test.done();
  }
}

exports.findExtForBasePath = {
  'should return a matching file with an extension': function(test) {
    var basename = projectDir + "/client/views/main";

    test.expect(1);
    test.strictEqual( fileUtils.findExtForBasePath(basename), ".jade" );

    test.done();
  },

  'should return the alpha-first matching file if there are multiple': function(test) {
    var basename      = testDir + "/view",
        matchingFiles;

    test.expect(2);

    matchingFiles = fs.readdirSync(path.join(basename, '..')).filter(function(file) {
      return !!file.match(new RegExp('^' + path.basename(basename)));
    });

    test.ok( matchingFiles.length > 1 );
    test.strictEqual( fileUtils.findExtForBasePath(basename), ".html" );

    test.done();
  },

  'should return null for no matching files': function(test) {
    var basename = projectDir + "/client/views/justice";

    test.expect(1);

    test.equal( fileUtils.findExtForBasePath(basename), null );

    test.done();
  },

  'should return null for files that do not exist': function(test) {
    var basename = testDir + "/i-dont-exist";

    test.expect(1);
    test.equal( should.not.exist(fileUtils.findExtForBasePath(basename)), null );

    test.done();
  },
}
