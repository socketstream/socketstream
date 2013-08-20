/*jshint expr:true */

"use strict";

var fs         = require('fs'),
    path       = require('path'),
    should     = require('should'),
    fileUtils  = require( path.join(process.env.PWD, 'lib/utils/file') ),
    projectDir = path.join(process.env.PWD, 'test/fixtures/project'),
    testDir    = path.join(process.env.PWD, 'test/fixtures/files');

describe('isDir', function() {
  it('should return true for directories', function() {
    fileUtils.isDir(projectDir).should.be.true;
    fileUtils.isDir(projectDir + "/client").should.be.true;
  });

  it('should return false for non-directories', function() {
    fileUtils.isDir(projectDir + "/app.js").should.be.false;
    fileUtils.isDir(projectDir + "/client/views/main.jade").should.be.false;
  });
});

describe('findExtForBasePath', function() {

  it('should return a matching file with an extension', function() {
    var basename = projectDir + "/client/views/main";

    fileUtils.findExtForBasePath(basename).should.equal(".jade");
  });

  it('should return the alpha-first matching file if there are multiple', function() {
    var basename      = testDir + "/view",
        matchingFiles;

    matchingFiles = fs.readdirSync(path.join(basename, '..')).filter(function(file) {
      return !!file.match(new RegExp('^' + path.basename(basename)));
    });

    matchingFiles.length.should.be.above(1);
    fileUtils.findExtForBasePath(basename).should.equal(".html");
  });

  it('should return null for no matching files', function() {
    var basename = projectDir + "/client/views/justice";

    should.not.exist(fileUtils.findExtForBasePath(basename));
  });

  it('should return null for files that do not exist', function() {
    var basename = testDir + "/i-dont-exist";

    should.not.exist(fileUtils.findExtForBasePath(basename));
  });
});
