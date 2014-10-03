'use strict';



// Dependencies

var require               = require('../helpers/uncache');



describe('lib/socketstream', function () {



    beforeEach(function (done) {
        require.uncache('../../lib/socketstream.js');
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
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('cucumber');
            done();
        });



        it('should inherit the Node environment variable from SS_ENV, if passed', function (done) {
            process.env.SS_ENV = 'staging';
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('staging');
            done();
        });



        it('should default to development, if neither NODE_ENV or SS_ENV are passed', function (done) {
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('development');
            done();
        });



    });



});