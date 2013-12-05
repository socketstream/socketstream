'use strict';

var path           = require('path'),
    connect        = require('connect'),
    httpFunc       = require( path.join(process.env.PWD, 'lib/http/index') ),
    http           = null,
    app            = null,
    ac             = require('../../helpers/assertionCounter'),
    sessionStore   = new connect.session.MemoryStore,
    sessionOptions = {
        maxAge: 2592000000
    },
    root           = path.join(process.cwd(), 'test', 'fixtures', 'project'); // replace '\' with '/' to support Windows

describe('lib/http/index', function () {

    beforeEach(function (done) {

        ac.reset();
        http = null;
        app  = null;
        done();
    });

    describe('module.exports', function () {
        it('should return a http function instance', function (done) {
            ac.expect(1);

            httpFunc.should.be.type('function').andCheck();
            ac.check(done);
        });
    });

    describe('module.exports()', function () {
        it('should return http instance', function (done) {
            ac.expect(3);

            http = httpFunc(root);

            http.set.should.be.type('function').andCheck();
            http.load.should.be.type('function').andCheck();
            http.route.should.be.type('function').andCheck();

// console.dir(http.load('client/static', sessionStore, sessionOptions));

            ac.check(done);
        });
    });

    describe('.load()', function () {
        it('should append SocketStream middleware to stack', function (done) {
            ac.expect(0);

            http = httpFunc(root);

            // console.log('http', http);

            app = http.load('client/static', sessionStore, sessionOptions);

            // console.log('app', http.request);
            // http.middleware.request().get('/favicon.ico').should.equla('1');

            // http.set.should.be.type('function').andCheck();
            // http.load.should.be.type('function').andCheck();
            // http.route.should.be.type('function').andCheck();


            ac.check(done);
        });
    });
});