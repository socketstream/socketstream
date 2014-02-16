'use strict';



// Dependencies

var ac            = require('../helpers/assertionCounter');



describe('lib/socketstream', function () {



    beforeEach(function (done) {

        process.env.NODE_ENV = undefined;
        ac.reset();
        done();

    });



    afterEach(function (done) {

        process.env.NODE_ENV = 'test';
        done();

    });



    describe('exports.env', function () {



        it('should inherit the Node environment variable from NODE_ENV, if passed');



        it('should inherit the Node environment variable from SS_ENV, if passed');



        it('should default to development, if neither NODE_ENV or SS_ENV are passed', function (done) {
            ac.expect(1);
            var socketstream = require('../../lib/socketstream.js');
            socketstream.env.should.equal('development').andCheck();
            ac.check(done);
        });



    });



});