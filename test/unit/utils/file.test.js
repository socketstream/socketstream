/*jshint immed: false */

'use strict';

var fs              = require('fs'),
    path            = require('path'),
    fileUtils       = require( path.join('../../..', 'lib/utils/file') ),
    projectDir      = path.join(__dirname,'../../fixtures', 'project'),
    testDir         = path.join(__dirname,'../../fixtures', 'files'),
    testReadDirSync = path.join(__dirname,'../../fixtures', 'readDirSync');

describe('lib/utils/file', function () {
    describe('.isDir()', function () {

        it('should return true for directories', function (done) {

            fileUtils.isDir(projectDir).should.equal(true);
            fileUtils.isDir(projectDir + '/client').should.equal(true);

            done();
        });

        it('should return false for non-directories', function (done) {

            fileUtils.isDir(projectDir + '/app.js').should.equal(false);
            fileUtils.isDir(projectDir + '/client/views/main.jade').should.equal(false);

            done();

        });

    });


    describe('.readDirSync()', function () {

        it('should read directory in recursive mode', function (done) {
            var found;

            found = fileUtils.readDirSync(testReadDirSync);

            found.should.be.an.instanceOf(Object);
            found.should.have.properties('files', 'dirs');

            found.files.should.be.an.instanceOf(Array);
            found.dirs.should.be.an.instanceOf(Array);

            found.should.have.property('files').with.lengthOf(6);
            found.should.have.property('dirs').with.lengthOf(10);

            /* check all the subdirectories */
            found.dirs.indexOf( path.join(testReadDirSync, 'dir1') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir2') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.1') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.2') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.1') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.2') ).should.not.eql(-1);
            found.dirs.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.3') ).should.not.eql(-1);

            /* check all the files in subdirectories */
            found.files.indexOf( path.join(testReadDirSync, 'index.js') ).should.not.eql(-1);
            found.files.indexOf( path.join(testReadDirSync, 'dir2', 'index.html') ).should.not.eql(-1);
            found.files.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.2', 'dir3.2.1', 'test.js') ).should.not.eql(-1);
            found.files.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'test.css') ).should.not.eql(-1);
            found.files.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.2', 'test.csv') ).should.not.eql(-1);
            found.files.indexOf( path.join(testReadDirSync, 'dir3', 'dir3.3', 'dir3.3.3', 'test.sh') ).should.not.eql(-1);

            done();
        });

        it('should not throw an error if path is missing (does not exist)', function (done) {
            var start = path.join(testReadDirSync, 'unexisting_directory');

            (function() {
                fileUtils.readDirSync( start );

            }).should.not.throw();

            done();

        });

        it('should throw an error if path exists, but not a directory', function (done) {
            var start = path.join(testReadDirSync, 'dir2', 'index.html');

            (function() {
                fileUtils.readDirSync( start );

            }).should.throw('path: ' + start + ' is not a directory');

            done();

        })

    });

    describe('.loadPackageJSON()', function () {

        it('should read SocketStream\'s package.json file from the root directory', function (done) {
            var pkg;

            (function() {
                pkg = fileUtils.loadPackageJSON(testReadDirSync);

            }).should.not.throw();

            pkg.should.be.an.instanceOf(Object);
            pkg.should.have.property('name').equal('socketstream');

            done();
        });
    });

    describe('.findExtForBasePath()', function () {

        it('should return a matching file with an extension', function (done) {

            var basename = projectDir + '/client/views/main';
            fileUtils.findExtForBasePath(basename).should.equal('.jade');

            done();
        });

        it('should return the alpha-first matching file if there are multiple', function (done) {

            var basename      = testDir + '/view',
                matchingFiles;

            matchingFiles = fs.readdirSync(path.join(basename, '..')).filter(function(file) {
                return !!file.match(new RegExp('^' + path.basename(basename)));
            });

            (matchingFiles.length > 1).should.equal(true);
            fileUtils.findExtForBasePath(basename).should.equal('.html');

            done();
        });

        it('should return null for no matching files', function (done) {

            var basename = projectDir + '/client/views/justice';
            (fileUtils.findExtForBasePath(basename) === null).should.equal(true);

            done();

        });

        it('should return null for files that do not exist', function (done) {

            var basename = testDir + '/i-dont-exist';
            require('should').not.exist(fileUtils.findExtForBasePath(basename));
            done();

        });
    });
});
