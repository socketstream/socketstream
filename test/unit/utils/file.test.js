/*jshint immed: false */

'use strict';

var fs              = require('fs'),
    path            = require('path'),
    should          = require('should'),
    ac              = require('../../helpers/assertionCounter'),
    fileUtils       = require( path.join(process.env.PWD, 'lib/utils/file') ),
    projectDir      = path.join(process.env.PWD, 'test/fixtures/project'),
    testDir         = path.join(process.env.PWD, 'test/fixtures/files'),
    testReadDirSync = path.join(process.env.PWD, 'test/fixtures/readDirSync');

describe('lib/utils/file', function () {
    describe('.isDir()', function () {

        // Used to reset the counters before each test
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


    describe('.readDirSync()', function () {

        // Used to reset the counters before each test
        beforeEach(ac.reset);

        it('should read directory in recursive mode', function (done) {
            var found;

            ac.expect(23);

            found = fileUtils.readDirSync(testReadDirSync);

            found.should.be.an.instanceOf(Object).andCheck();
            found.should.have.properties('files', 'dirs').andCheck();

            found.files.should.be.an.instanceOf(Array).andCheck();
            found.dirs.should.be.an.instanceOf(Array).andCheck();

            found.should.have.property('files').with.lengthOf(6).andCheck();
            found.should.have.property('dirs').with.lengthOf(10).andCheck();

            /* check all the subdirectories */
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir1') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir2') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.1') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.2') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.1') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.2') ).andCheck();
            found.dirs.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.3') ).andCheck();

            /* check all the files in subdirectories */
            found.files.should.includeEql( path.join(testReadDirSync, 'index.js') ).andCheck();
            found.files.should.includeEql( path.join(testReadDirSync, 'dir2', 'index.html') ).andCheck();
            found.files.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1', 'test.js') ).andCheck();
            found.files.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'test.css') ).andCheck();
            found.files.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.2', 'test.csv') ).andCheck();
            found.files.should.includeEql( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.3', 'test.sh') ).andCheck();

            ac.check(done);
        });

        it('should not throw an error if path is missing (does not exist)', function (done) {
            var start = path.join(testReadDirSync, 'unexisting_directory');

            ac.expect(0);

            (function() {
                fileUtils.readDirSync( start );

            }).should.not.throw();

            ac.check(done);

        });

        it('should throw an error if path exists, but not a directory', function (done) {
            var start = path.join(testReadDirSync, 'dir2', 'index.html');

            ac.expect(0);

            (function() {
                fileUtils.readDirSync( start );

            }).should.throw("path: " + start + " is not a directory");

            ac.check(done);

        })

    });

    describe('.loadPackageJSON()', function () {

        // Used to reset the counters before each test
        beforeEach(ac.reset);

        it("should SocketStream's package.json file from the root directory", function (done) {
            var pkg;

            // Used to reset the counters before each test
            beforeEach(ac.reset);

            ac.expect(2);

            (function() {
                pkg = fileUtils.loadPackageJSON(testReadDirSync);

            }).should.not.throw();

            pkg.should.be.an.instanceOf(Object).andCheck();
            pkg.should.have.property('name').equal('socketstream').andCheck();

            ac.check(done);
        });
    });

    describe('.findExtForBasePath()', function () {

        // Used to reset the counters before each test
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
});
