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
require('../../helpers/connect');

var path           = require('path'),
    connect        = require('connect'),
    httpFunc       = require( path.join(process.env.PWD, 'lib/http/index') ),
    http           = null,
    app            = null,
    ac             = require('../../helpers/assertionCounter'),
    utils          = require('../../helpers/utils.js'),
    sessionStore   = new connect.session.MemoryStore,
    settings       = {        // User-configurable settings with sensible defaults
      "static": {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      secure: false           // allow setting of the 'secure' cookie attribute when using SSL - see https://github.com/socketstream/socketstream/issues/349
    },
    sessionOptions = {
        maxAge: 2592000000
    },
    root           = path.join(process.cwd(), 'test/fixtures/project'); // replace '\' with '/' to support Windows

function testPrependMiddleware(req, res, next) {
    next();
}

function testAppendMiddleware(req, res, next) {
    if (req) {
        next();
    }
}

describe('lib/http/index', function () {

    beforeEach(function (done) {
        ac.reset();
        http = null;
        app  = null;
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

            http = httpFunc(root);

            http.set.should.be.type('function').andCheck();
            http.load.should.be.type('function').andCheck();
            http.route.should.be.type('function').andCheck();

            ac.check(done);
        });
    });

    describe('.set()', function () {
        it('should set newSettings into private settings object');
    });

    describe('.route()', function () {
        it('should add event listener for the url');
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

        describe('return object', function () {
            beforeEach(setUp);

            it('should an instance Object', function (done) {
                ac.expect(1);
                http.should.be.an.instanceOf(Object).andCheck();
                ac.check(done);
            });

            it('should respond for \'/favicon.ico\' request', function (done) {
                ac.expect(1);

                http.middleware.request().get('/favicon.ico').end(function(res) {
                    res.statusCode.should.equal(200).andCheck();
                    ac.check(done);
                });
            });
        });

    });
});