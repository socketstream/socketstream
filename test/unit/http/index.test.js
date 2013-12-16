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
 *         ac.check(done);
 *     });
 *
 */

var request      = require('supertest'),
    ac           = require('../../helpers/assertionCounter'),
    path         = require('path'),
    connect      = require('connect'),
    util         = require('util'),
    httpFunc     = require( path.join(process.env.PWD, 'lib/http/index') ),
    http         = null,
    app          = null,
    utils        = require('../../helpers/utils.js'),
    sessionStore = new connect.session.MemoryStore,
    settings     = {        // User-configurable settings with sensible defaults
      "static": {
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
        ac.reset();
        http = httpFunc(root);
        done();
    });

    describe('module.exports', function () {
        it('should return a {Function} instance', function (done) {
            ac.expect(1);

            httpFunc.should.be.type('function').andCheck();
            ac.check(done);
        });
    });

    describe('module.exports()', function () {
        it('should return http {Object} instance', function (done) {
            ac.expect(3);
            http.set.should.be.type('function').andCheck();
            http.load.should.be.type('function').andCheck();
            http.route.should.be.type('function').andCheck();

            ac.check(done);
        });
    });

    describe('.set()', function () {
        beforeEach(function (done) {
          http = httpFunc(root);
          done();
        });

        it('should set newSettings into the private settings object', function (done) {
            var newSettings = {
                secure: true
            };

            ac.expect(0);
            /* Should now throw an error */
            http.set(newSettings);
            ac.check(done);
        });

        it('should throw an error if passed argument is not an object', function (done) {
            var newSettings = '';

            ac.expect(0);

            /* Should throw an error */
            (function() {
                http.set(newSettings);
            }).should.throw('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}');

            ac.check(done);
        });
    });

    describe('.route()', function () {
        var obj;

        beforeEach(function(done) {
            obj  = null;
            http = httpFunc(root);
            done();
        });

        it('should add event listener for the url', function (done) {
            function callback(req, res) {
                res.serve('main');
            }

            ac.expect(6);

            obj = http.route('/', callback);

            obj.should.be.an.instanceOf(Object).andCheck();
            obj._events.should.be.an.instanceOf(Object).andCheck();
            obj.listenerTree.should.be.an.instanceOf(Object).andCheck();
            obj.listenerTree['/'].should.be.an.instanceOf(Object).andCheck();
            obj.listenerTree['/']._listeners.should.be.an.instanceOf(Object).andCheck();
            obj.listenerTree['/']._listeners.toString().should.include(callback.toString()).andCheck();

            ac.check(done);
        });

        it('should add default event listener for the url with out callback', function (done) {
            var router,
                url,
                callback = function(name) {
                    return router.on(url, function(req, res) {
                        return res.serveClient(name);
                    });
                }

            ac.expect(3);

            obj = http.route('/');

            obj.should.be.an.instanceOf(Object).andCheck();
            obj.serveClient.should.be.an.instanceOf(Object).andCheck();
            obj.serveClient.toString().replace(/(\s+|\n)/g, ' ').should.include(callback.toString().replace(/(\s+|\n)/g, ' ')).andCheck();

            ac.check(done);
        });

        it('should throw an error if does not start with \'/\'', function (done) {
            var url = 'some_url_wwith_no_slash_at_the_start';

            function callback(req, res) {
                res.serve('main');
            }

            ac.expect(0);

            (function() {
                http.route(url, callback);

            }).should.throw( util.format('%s is not a valid URL. Valid URLs must start with /', url) );


            ac.check(done);
        });
    });

    describe('.load()', function () {
        var staticPath = '';

        function setUp(done) {
            staticPath = 'client/static';

            /* Loading http function */
            http = httpFunc(root);

            /* adding some test middlewars */
            http.middleware.prepend(testPrependMiddleware);
            http.middleware.append(testAppendMiddleware);

            /* loading http server assets */
            app = http.load(staticPath, sessionStore, sessionOptions);

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

        describe('itself', function () {
            beforeEach(setUp);

            /**
             * connect.compress() should be added to middleware stack on highest possible position
             */
            it('should build propper middleware stack', function (done) {
                ac.expect(18);

                /* testing correct length of http.middleware.stack */
                http.middleware.stack.should.be.an.instanceOf(Array).andCheck();
                http.middleware.stack.should.have.length(8).andCheck();

                /**
                 * testing testPrependMiddleware
                 * lib/http/index.js:104
                 */
                http.middleware.stack[0].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[0].handle.toString().should.equal( testPrependMiddleware.toString() ).andCheck();

                /**
                 * testing connect.compress()
                 * It should be added to middleware stack on highest possible position
                 * lib/http/index.js:142
                 */
                http.middleware.stack[1].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[1].handle.toString().should.equal( connect.compress().toString() ).andCheck();

                /**
                 * testing connect.cookieParser('SocketStream')
                 * lib/http/index.js:145
                 */
                http.middleware.stack[2].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[2].handle.toString().should.equal( connect.cookieParser('SocketStream').toString() ).andCheck();

                /**
                 * testing connect.favicon()
                 * lib/http/index.js:145
                 */
                http.middleware.stack[3].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[3].handle.toString().should.equal( connect.favicon( staticPath + '/favicon.ico').toString() ).andCheck();

                /**
                 * testing connect.session()
                 * lib/http/index.js:145
                 */
                http.middleware.stack[4].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[4].handle.toString().should.equal( connect.session({
                    cookie: {
                        path: '/',
                        httpOnly: false,
                        maxAge: sessionOptions.maxAge,
                        secure: settings.secure
                    },
                    store: sessionStore
                }).toString() ).andCheck();

                /**
                 * testing testAppendMiddleware
                 * lib/http/index.js:156
                 */
                http.middleware.stack[5].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[5].handle.toString().should.equal( testAppendMiddleware.toString() ).andCheck();

                /**
                 * testing eventMiddleware
                 * since there ra no way to get the instance of eventMiddleware function,
                 * just compare the functions names
                 * lib/http/index.js:161
                 */
                http.middleware.stack[6].handle.should.be.an.instanceOf(Function).andCheck();
                utils.getfunctionName( http.middleware.stack[6].handle ).should.equal( 'eventMiddleware' ).andCheck();

                /**
                 * testing connect["static"]()
                 * lib/http/index.js:161
                 */
                http.middleware.stack[7].handle.should.be.an.instanceOf(Function).andCheck();
                http.middleware.stack[7].handle.toString().should.equal( connect["static"](staticPath, settings["static"]).toString() ).andCheck();

                ac.check(done);
            });
        })

        describe('return app/http object', function () {
            beforeEach(setUp);

            it('should be an instance of Object', function (done) {
                ac.expect(1);
                app.should.be.an.instanceOf(Object).andCheck();
                ac.check(done);
            });

            it('should respond with status 200 for /favicon.ico request', function (done) {
                ac.expect(1);

                request(app).get('/favicon.ico').end(function(err, res) {
                    res.statusCode.should.equal(200).andCheck();
                    ac.check(done);
                });
            });
        });
    });
});