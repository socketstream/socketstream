'use strict';



// Dependencies
//
var fs         = require('fs'),
    path       = require('path'),
    should     = require('should'),
    ac         = require('../../helpers/assertionCounter'),
    fileUtils  = require( path.join(process.env.PWD, 'lib/utils/file') ),
    projectDir = path.join(process.env.PWD, 'test/fixtures/project'),
    testDir    = path.join(process.env.PWD, 'test/fixtures/files');
    



describe('isDir', function () {



    // Used to reset the counters before each test
    //
    beforeEach(ac.reset);



    it('should return true for directories', function (done) {

        ac.expect(2);
      
        fileUtils.isDir(projectDir).should.equal(true).andCheck();
        fileUtils.isDir(projectDir + '/client').should.equal(true).andCheck();

        ac.check(done);

    });



    it('should return false for non-directories', function (done) {

        ac.expect(2);

        fileUtils.isDir(projectDir + '/app.js').should.equal(false).andCheck();
        fileUtils.isDir(projectDir + '/client/views/main.jade').should.equal(false).andCheck();

        ac.check(done);

    });



});



describe('findExtForBasePath', function () {



    // Used to reset the counters before each test
    //
    beforeEach(ac.reset);

 

    it('should return a matching file with an extension', function (done) {

        ac.expect(1);

        var basename = projectDir + '/client/views/main';
        fileUtils.findExtForBasePath(basename).should.equal('.jade').andCheck();

        ac.check(done);
   
    });



    it('should return the alpha-first matching file if there are multiple', function (done) {

        ac.expect(2);

        var basename      = testDir + '/view',
            matchingFiles;

        matchingFiles = fs.readdirSync(path.join(basename, '..')).filter(function(file) {
            return !!file.match(new RegExp('^' + path.basename(basename)));
        });

        (matchingFiles.length > 1).should.equal(true).andCheck();
        fileUtils.findExtForBasePath(basename).should.equal('.html').andCheck();

        ac.check(done);

    });



    it('should return null for no matching files', function (done) {

        ac.expect(1);

        var basename = projectDir + '/client/views/justice';
        (fileUtils.findExtForBasePath(basename) === null).should.equal(true).andCheck();

        ac.check(done);

    });



    it('should return null for files that do not exist', function (done) {

        ac.expect(1);

        var basename = testDir + '/i-dont-exist';
        ac.andCheck(should.not.exist(fileUtils.findExtForBasePath(basename)));

        ac.check(done);

    });



});