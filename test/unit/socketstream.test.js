'use strict';



// Dependencies

var ac                    = require('../helpers/assertionCounter'),
    require               = require('../helpers/uncache');



describe('lib/socketstream', function () {



    beforeEach(function (done) {
        require.uncache('../../lib/socketstream.js');
        delete process.env.SS_ENV;
        delete process.env.NODE_ENV;
        ac.reset();
        done();
    });



    afterEach(function (done) {
        delete process.env.SS_ENV;
        process.env.NODE_ENV  = 'test';
        done();
    });



    describe('exports.env', function () {



        it('should inherit the Node environment variable from NODE_ENV, if passed', function (done) {
            ac.expect(1);
            process.env.NODE_ENV = 'cucumber';
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('cucumber').andCheck();
            ac.check(done);
        });



        it('should inherit the Node environment variable from SS_ENV, if passed', function (done) {
            ac.expect(1);
            process.env.SS_ENV = 'staging';
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('staging').andCheck();
            ac.check(done);
        });



        it('should default to development, if neither NODE_ENV or SS_ENV are passed', function (done) {
            ac.expect(1);
            var ss = require('../../lib/socketstream.js');
            ss.env.should.equal('development').andCheck();
            ac.check(done);
        });



    });



});