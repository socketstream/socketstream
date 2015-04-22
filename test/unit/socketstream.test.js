'use strict';



// Dependencies

var uncachedRequire               = require('../helpers/uncache'),
  path = require('path');



describe('lib/socketstream', function () {

    var should = require('should');

    beforeEach(function (done) {
        uncachedRequire.uncache('../../lib/socketstream.js');
        delete process.env.SS_ENV;
        delete process.env.NODE_ENV;
        done();
    });



    afterEach(function (done) {
        delete process.env.SS_ENV;
        process.env.NODE_ENV  = 'test';
        done();
    });



    describe('exports.env', function () {



        it('should inherit the Node environment variable from NODE_ENV, if passed', function (done) {
            process.env.NODE_ENV = 'cucumber';
            var ss = uncachedRequire('../../lib/socketstream.js');
            ss.env.should.equal('cucumber');
            done();
        });



        it('should inherit the Node environment variable from SS_ENV, if passed', function (done) {
            process.env.SS_ENV = 'staging';
            var ss = uncachedRequire('../../lib/socketstream.js');
            ss.env.should.equal('staging');
            done();
        });



        it('should default to development, if neither NODE_ENV or SS_ENV are passed', function (done) {
            var ss = uncachedRequire('../../lib/socketstream.js');
            ss.env.should.equal('development');
            done();
        });
    });

    describe('API', function() {

        it('should allow extension', function() {
          var ss = uncachedRequire('../../lib/socketstream.js');
          ss.api.add('abc',{abc:'abc'});
          ss.api.abc.should.eql({abc:'abc'});
          should(function() {
            ss.api.add('abc',{abc:'def'});
          }).throw(Error);
        });
    });

    describe('start', function() {

        it('should start event serving clients', function() {
          process.chdir(path.join(__dirname, '../fixtures/project'));
          var ss = uncachedRequire('../../lib/socketstream.js');
          ss.root = ss.api.root = path.join(__dirname, '../fixtures/project');

          ss.client.define('abc', {
            css: 'main',
            code: 'main/demo.coffee',
            view: 'main.jade'
          });
          ss.http.route('/abc', function(req, res){
            res.serveClient('abc');
          });

          var http = require('http');
          var server = http.Server(ss.http.middleware);
          server.listen(13000);
          ss.start(server);

          //TODO test that /abc is served

        });
    });
});
