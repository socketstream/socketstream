'use strict';

var path   = require('path'),
    ac     = require('../../helpers/assertionCounter.js'),
    Router = require( path.join(process.env.PWD, 'lib/http/router.js') ).Router;

describe('lib/http/router', function () {

    it('should exports Router as a function', function (done) {
        ac.expect(1);

        Router.should.be.type('function').andCheck();
        ac.check(done);
    });

    describe('Router', function () {
        describe('.route(url, req, res)', function () {
            it('.route');
        });
    });

});


console.log('router', Router);