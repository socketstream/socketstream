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
    serveStatic  = require('../../../lib/utils/serve-static'),
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

        describe('#route()', function () {
            var obj;

            beforeEach(function() {
                obj  = null;
                ss.client.reset();
            });

            it('should add event listener for given url', function () {
                function callback(req, res) {
                    res.serve('main');
                }

                obj = ss.http.route('/', callback);

                obj.should.be.an.instanceOf(Object);
                obj._events.should.be.an.instanceOf(Object);
                obj.listenerTree.should.be.an.instanceOf(Object);
                obj.listenerTree['/'].should.be.an.instanceOf(Object);
                obj.listenerTree['/']._listeners.should.be.an.instanceOf(Object);
                obj.listenerTree['/']._listeners.toString().indexOf(callback.toString()).should.not.eql(-1);
            });

            it('should add default event listener for the url without a callback', function () {
                // var router,
                //     url;
                    // callback = function(name) {
                    //     return router.on(url, function(req, res) {
                    //         return res.serveClient(name);
                    //     });
                    // }

                obj = ss.http.route('/');

                obj.should.be.an.instanceOf(Object);
                obj.serveClient.should.be.an.instanceOf(Object);

                // NOTE - we need to do some less-specific matching,
                // as istanbul injects listeners - PBJENSEN
                //
                obj.serveClient.toString().replace(/(\s+|\n)/g, ' ').indexOf('return res.serveClient(name)').should.not.eql(-1);
            });

            it('should throw an error if does not start with \'/\'', function () {
                var url = 'some_url_wwith_no_slash_at_the_start';

                function callback(req, res) {
                    res.serve('main');
                }

                (function() {
                    ss.http.route(url, callback);

                }).should.throw( util.format('%s is not a valid URL. Valid URLs must start with /', url) );
            });
        });

        describe('app setup with staticCache',function() {

          it('should use http.set configuration');

          it('should handle a sample request');

        });

        describe('app setup with prepended middleware', function() {

          it('should work for prepending require(body) parser');

        });

        describe('app setup without SS middleware',function() {

            var staticPath = '',
              assetsPath = '';

            function setUp() {
                ss.client.reset();
                staticPath = 'client/static';
                assetsPath = 'client/static/assets';

                /* loading http server assets */
                app = ss.http.load(staticPath, assetsPath, sessionStore, sessionOptions);
            }

            beforeEach(setUp);

            it('should not build the middleware stack', function () {

                /* testing correct length of http.middleware.stack */
                ss.http.middleware.stack.should.be.an.instanceOf(Array);
                ss.http.middleware.stack.should.have.length(0);
            });

        });

        describe('minimal strategy',function() {
           it('should serve static files',function(){});
           it('should serve assets',function(){});
           it('should serve assets outside the static root',function(){});
        });

        describe('#load()', function () {
            var staticPath = '',
                assetsPath = '';

            function setUp() {
                staticPath = 'client/static';
                assetsPath = 'client/static/assets';
                ss.client.reset();

                /* adding some test middlewars */
                ss.http.middleware.prepend(testPrependMiddleware);
                ss.http.middleware.append(testAppendMiddleware);

                require(path.join(__dirname,'../..','fixtures/project/node_modules/socketstream-addon'))(ss.api);

                /* loading http server assets */
                app = ss.http.load(staticPath, assetsPath, sessionStore, sessionOptions);
            }

            function testPrependMiddleware(req, res, next) {
                next();
            }

            function testAppendMiddleware(req, res, next) {
                if (req) {
                    next();
                }
            }

            beforeEach(setUp);

            it('should build the middleware stack', function () {

                /* testing correct length of http.middleware.stack */
                ss.http.middleware.stack.should.be.an.instanceOf(Array);
                ss.http.middleware.stack.should.have.length(6);

                /**
                 * testing testPrependMiddleware
                 * lib/http/index.js:104
                 */
                ss.http.middleware.stack[0].handle.should.be.an.instanceOf(Function);
                ss.http.middleware.stack[0].handle.toString().should.equal( testPrependMiddleware.toString() );

                /**
                 * testing expressSession()
                 * lib/http/index.js:145
                 */
                ss.http.middleware.stack[1].handle.should.be.an.instanceOf(Function);
                utils.getfunctionName(ss.http.middleware.stack[1].handle).should.equal( 'sessionMiddleware' );

                /**
                 * testing testAppendMiddleware
                 * lib/http/index.js:156
                 */
                ss.http.middleware.stack[2].handle.should.be.an.instanceOf(Function);
                ss.http.middleware.stack[2].handle.toString().should.equal( testAppendMiddleware.toString() );

                /**
                 * testing eventMiddleware
                 * since there ra no way to get the instance of eventMiddleware function,
                 * just compare the functions names
                 * lib/http/index.js:161
                 */
                ss.http.middleware.stack[3].handle.should.be.an.instanceOf(Function);
                utils.getfunctionName( ss.http.middleware.stack[3].handle ).should.equal( 'eventMiddleware' );

                /**
                 * testing assets resource middleware
                 * lib/http/index.js:161
                 */
                ss.http.middleware.stack[4].handle.should.be.an.instanceOf(Function);
                ss.http.middleware.stack[4].handle.toString().should.equal( serveStatic('/assets',assetsPath, settings.static).toString() );

                /**
                 * testing static resource middleware
                 * lib/http/index.js:161
                 */
                ss.http.middleware.stack[5].handle.should.be.an.instanceOf(Function);
                ss.http.middleware.stack[5].handle.toString().should.equal( serveStatic('',staticPath, settings.static).toString() );
            });

            describe('returned app/http object', function () {
                beforeEach(setUp);

                it('should be an instance of Object', function () {
                    app.should.be.an.instanceOf(Object);
                });

                it('should respond with status 200 for /favicon.ico request', function () {
                    request(app).get('/favicon.ico').end(function(err, res) {
                        res.statusCode.should.equal(200);
                    });
                });
            });
        });
    });

});
