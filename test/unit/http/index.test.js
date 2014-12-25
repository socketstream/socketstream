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

var request      = require('supertest'),
    path         = require('path'),
    connect      = require('connect'),
    util         = require('util'),
    httpFunc     = require( path.join(process.env.PWD, 'lib/http/index') ),
    serveStatic  = require('../../../lib/utils/serve-static'),
    http         = null,
    app          = null,
    utils        = require('../../helpers/utils.js'),
    sessionStore = new connect.session.MemoryStore,
    settings     = {        // User-configurable settings with sensible defaults
      static: {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      secure: false           // allow setting of the 'secure' cookie attribute when using SSL - see https://github.com/socketstream/socketstream/issues/349
    },
    sessionOptions = {
        maxAge: 2592000000
    },
    root           = path.join(process.cwd(), 'test/fixtures/project'); // replace '\' with '/' to support Windows

describe('lib/http/index', function () {

    beforeEach(function (done) {
        http = httpFunc(root);
        done();
    });

    describe('module.exports', function () {
        it('should return a function instance', function (done) {
            httpFunc.should.be.type('function');
            done();
        });
    });

    describe('module.exports()', function () {
        it('should return an http object instance', function (done) {
            http.should.be.type('object').with.properties('set', 'load', 'route');
            http.set.should.be.type('function');
            http.load.should.be.type('function');
            http.route.should.be.type('function');
            done();
        });

        describe('#set()', function () {
            beforeEach(function (done) {
              http = httpFunc(root);
              done();
            });

            it('should set newSettings into the private settings object', function (done) {
                var newSettings = {
                    secure: true
                };

                /* Should now throw an error */
                http.set(newSettings);
                done();
            });

            it('should throw an error if passed argument is not an object', function (done) {
                var newSettings = '';

                /* Should throw an error */
                (function() {
                    http.set(newSettings);
                }).should.throw('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}');
                done();
            });
        });

        describe('#route()', function () {
            var obj;

            beforeEach(function(done) {
                obj  = null;
                http = httpFunc(root);
                done();
            });

            it('should add event listener for given url', function (done) {
                function callback(req, res) {
                    res.serve('main');
                }

                obj = http.route('/', callback);

                obj.should.be.an.instanceOf(Object);
                obj._events.should.be.an.instanceOf(Object);
                obj.listenerTree.should.be.an.instanceOf(Object);
                obj.listenerTree['/'].should.be.an.instanceOf(Object);
                obj.listenerTree['/']._listeners.should.be.an.instanceOf(Object);
                obj.listenerTree['/']._listeners.toString().indexOf(callback.toString()).should.not.eql(-1);

                done();
            });

            it('should add default event listener for the url without a callback', function (done) {
                // var router,
                //     url;
                    // callback = function(name) {
                    //     return router.on(url, function(req, res) {
                    //         return res.serveClient(name);
                    //     });
                    // }

                obj = http.route('/');

                obj.should.be.an.instanceOf(Object);
                obj.serveClient.should.be.an.instanceOf(Object);

                // NOTE - we need to do some less-specific matching, 
                // as istanbul injects listeners - PBJENSEN
                //
                obj.serveClient.toString().replace(/(\s+|\n)/g, ' ').indexOf('return res.serveClient(name)').should.not.eql(-1);
                done();
            });

            it('should throw an error if does not start with \'/\'', function (done) {
                var url = 'some_url_wwith_no_slash_at_the_start';

                function callback(req, res) {
                    res.serve('main');
                }

                (function() {
                    http.route(url, callback);

                }).should.throw( util.format('%s is not a valid URL. Valid URLs must start with /', url) );
                done();
            });
        });

        describe('app setup without SS middleware',function() {

        });

        describe('minimal strategy',function() {
           it('should serve static files',function(){});
           it('should serve assets',function(){});
           it('should serve assets outside the static root',function(){});
        });

        describe('#load()', function () {
            var staticPath = '',
                assetsPath = '';

            function setUp(done) {
                staticPath = 'client/static';
                assetsPath = 'client/static/assets';

                /* Loading http function */
                http = httpFunc(root);

                /* adding some test middlewars */
                http.middleware.prepend(testPrependMiddleware);
                http.middleware.append(testAppendMiddleware);

                /* loading http server assets */
                app = http.load(staticPath, assetsPath, sessionStore, sessionOptions);

                done();
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

            /**
             * connect.compress() should be added to middleware stack on highest possible position
             */
            it('should build the middleware stack', function (done) {

                /* testing correct length of http.middleware.stack */
                http.middleware.stack.should.be.an.instanceOf(Array);
                http.middleware.stack.should.have.length(9);

                /**
                 * testing testPrependMiddleware
                 * lib/http/index.js:104
                 */
                http.middleware.stack[0].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[0].handle.toString().should.equal( testPrependMiddleware.toString() );

                /**
                 * testing connect.compress()
                 * It should be added to middleware stack on highest possible position
                 * lib/http/index.js:142
                 */
                http.middleware.stack[1].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[1].handle.toString().should.equal( connect.compress().toString() );

                /**
                 * testing connect.cookieParser('SocketStream')
                 * lib/http/index.js:145
                 */
                http.middleware.stack[2].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[2].handle.toString().should.equal( connect.cookieParser('SocketStream').toString() );

                /**
                 * testing connect.favicon()
                 * lib/http/index.js:145
                 */
                http.middleware.stack[3].handle.should.be.an.instanceOf(Function);

                http.middleware.stack[3].handle.toString().should.equal( connect.favicon( 'new_project/' + staticPath + '/favicon.ico').toString() );

                /**
                 * testing connect.session()
                 * lib/http/index.js:145
                 */
                http.middleware.stack[4].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[4].handle.toString().should.equal( connect.session({
                    cookie: {
                        path: '/',
                        httpOnly: false,
                        maxAge: sessionOptions.maxAge,
                        secure: settings.secure
                    },
                    store: sessionStore
                }).toString() );

                /**
                 * testing testAppendMiddleware
                 * lib/http/index.js:156
                 */
                http.middleware.stack[5].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[5].handle.toString().should.equal( testAppendMiddleware.toString() );

                /**
                 * testing eventMiddleware
                 * since there ra no way to get the instance of eventMiddleware function,
                 * just compare the functions names
                 * lib/http/index.js:161
                 */
                http.middleware.stack[6].handle.should.be.an.instanceOf(Function);
                utils.getfunctionName( http.middleware.stack[6].handle ).should.equal( 'eventMiddleware' );

                /**
                 * testing assets resource middleware
                 * lib/http/index.js:161
                 */
                http.middleware.stack[7].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[7].handle.toString().should.equal( serveStatic('/assets',assetsPath, settings.static).toString() );

                /**
                 * testing static resource middleware
                 * lib/http/index.js:161
                 */
                http.middleware.stack[8].handle.should.be.an.instanceOf(Function);
                http.middleware.stack[8].handle.toString().should.equal( serveStatic('',staticPath, settings.static).toString() );

                done();
            });

            describe('returned app/http object', function () {
                beforeEach(setUp);

                it('should be an instance of Object', function (done) {
                    app.should.be.an.instanceOf(Object);
                    done();
                });

                it('should respond with status 200 for /favicon.ico request', function (done) {
                    request(app).get('/favicon.ico').end(function(err, res) {
                        res.statusCode.should.equal(200);
                        done();
                    });
                });
            });
        });
    });

});