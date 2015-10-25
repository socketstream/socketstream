/*jshint immed: false */

'use strict';

/**
 * Using mock for connect.
 * Mock includes additional methods for testing as .get(), .end(), etc.
 * To be able to check http respond right away
 *
 * Example:
 *
 *     http.middleware.request().get('/favicon.ico').end(function(res) {
 *         res.statusCode.should.equal(200);
 *         done();
 *     });
 *
 */
var expressSession = require('express-session');

var request      = require('supertest'),
    path         = require('path'),
    util         = require('util'),
    ss = require( '../../fixtures/socketstream' ),
    app          = null,
    utils        = require('../../helpers/utils.js'),
    sessionStore = new expressSession.MemoryStore, //TODO testable without express-session
    settings     = {        // User-configurable settings with sensible defaults
      static: {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      secure: false           // allow setting of the 'secure' cookie attribute when using SSL - see https://github.com/socketstream/socketstream/issues/349
    },
    sessionOptions = {
        cookie: { path: '/', httpOnly: false, secure: false, maxAge: null },
        resave: true,
        saveUninitialized: true,
        secret:'not much',
        maxAge: 2592000000
    },
    fixtures    = require('../../fixtures');

ss.root = ss.api.root = fixtures.project;

describe('lib/http/index', function () {

    beforeEach(function () {
      ss.client.reset();
    });

    describe('module.exports()', function () {
        it('should return an http object instance', function () {
            ss.http.should.be.type('object').with.properties('set', 'load', 'route');
            ss.http.set.should.be.type('function');
            ss.http.load.should.be.type('function');
            ss.http.route.should.be.type('function');
        });

        describe('#set()', function () {
            beforeEach(function () {
              ss.client.reset();
            });

            it('should set newSettings into the private settings object', function () {
                var newSettings = {
                    secure: true
                };

                /* Should now throw an error */
                ss.http.set(newSettings);
            });

            it('should throw an error if passed argument is not an object', function () {
                var newSettings = '';

                /* Should throw an error */
                (function() {
                    ss.http.set(newSettings);
                }).should.throw('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}');
            });
        });
    });

});
