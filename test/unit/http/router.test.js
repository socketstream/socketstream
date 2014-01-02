/*jshint immed: false */

'use strict';

var path          = require('path'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    ac            = require('../../helpers/assertionCounter.js'),
    Router        = require( path.join(process.env.PWD, 'lib/http/router.js') ).Router,
    req           = {},
    res           = {},
    cb,
    router;

describe('lib/http/router', function () {

    beforeEach(function (done) {
        router = new (Router);

        cb = function() {
            return;
        }

        done();
    });

    it('should exports `Router` as a function', function (done) {
        ac.expect(1);

        Router.should.be.type('function').andCheck();
        ac.check(done);
    });

    describe('Router()', function () {

        it('should be an object', function (done) {
            ac.expect(1);
            router.should.be.type('object').andCheck();
            ac.check(done);
        });

        it('should have an object property #ee', function (done) {
            ac.expect(1);
            router.should.have.a.property('ee').with.a.type('object').andCheck();
            ac.check(done);
        });

        it('should have a function property #on', function (done) {
            ac.expect(1);
            router.should.have.a.property('on').with.a.type('function').andCheck();
            ac.check(done);
        });

        it('should have a function property #route', function (done) {
            ac.expect(1);
            router.should.have.a.property('route').with.a.type('function').andCheck();
            ac.check(done);
        });

        describe('Router#ee', function () {
            it('should be an instance of EventEmitter2', function (done) {
                ac.expect(1);
                router.ee.should.be.an.instanceOf(EventEmitter2).andCheck();
                ac.check(done);
            });

            it('should have an empty object property #_events', function (done) {
                ac.expect(2);
                router.ee.should.have.a.property('_events').with.a.type('object').andCheck();
                router.ee._events.should.be.empty.andCheck();
                ac.check(done);
            });

            it('should have a string property #delimiter = ?', function (done) {
                ac.expect(1);
                router.ee.should.have.a.property('delimiter', '?').with.a.type('string').andCheck();
                ac.check(done);
            });

            it('should have a boolean property #wildcard = true', function (done) {
                ac.expect(1);
                router.ee.should.have.a.property('wildcard', true).with.a.type('boolean').andCheck();
                ac.check(done);
            });

            it('should have an empty object property #listenerTree', function (done) {
                ac.expect(2);
                router.ee.should.have.a.property('listenerTree').with.a.type('object').andCheck();
                router.ee.listenerTree.should.be.empty.andCheck();
                ac.check(done);
            });
        });

        describe('Router#route(url, req, res)', function () {
            it('should return false for `/` if there are no routes and no listners', function (done) {
                ac.expect(1);
                router.route('/', req, res).should.be.false.andCheck();
                ac.check(done);
            });

            it('should return true for `/` if there is a listner for `/`', function (done) {
                ac.expect(1);

                router.on('/', cb);
                router.route('/', req, res).should.be.true.andCheck();
                ac.check(done);
            });

            it('should return false for `/` if there is a listner for `/404`', function (done) {
                ac.expect(1);

                router.on('/404', cb);
                router.route('/', req, res).should.be.false.andCheck();
                ac.check(done);
            });

            it('should return false for `/200` if there is a listner for `/404`', function (done) {
                ac.expect(1);

                router.on('/404', cb);
                router.route('/200', req, res).should.be.false.andCheck();
                ac.check(done);
            });

            it('should return false for an empty url', function (done) {
                ac.expect(1);

                router.on('/404', cb);
                router.route('', req, res).should.be.false.andCheck();
                ac.check(done);
            });

            it('should support Push State Routing', function (done) {
                ac.expect(5);

                router.on('/', cb);

                router.route('/1', req, res).should.be.true.andCheck();
                router.route('/1/', req, res).should.be.true.andCheck();
                router.route('/1/2', req, res).should.be.true.andCheck();
                router.route('/1/2/3', req, res).should.be.true.andCheck();
                router.route('/1/2/3/4', req, res).should.be.true.andCheck();
                ac.check(done);
            });

            it('should return true if the url request contains parameters', function (done) {
                ac.expect(2);

                router.on('/some-url', cb);
                router.route('/some-url?ts=12345', req, res).should.be.true.andCheck();
                router.route('/some-url/?ts=12345', req, res).should.be.true.andCheck();
                ac.check(done);
            });

            /**
             * test for #286 Static file error with 404
             * https://github.com/socketstream/socketstream/pull/419
             */
            it('should return false for static file and true for Push State Routing', function (done) {
                ac.expect(5);

                router.on('/', cb);

                router.route('/content/uploads/345.jpg', req, res).should.be.false.andCheck();
                router.route('/content/uploads/', req, res).should.be.true.andCheck();
                router.route('/content', req, res).should.be.true.andCheck();
                router.route('/', req, res).should.be.true.andCheck();
                router.route('', req, res).should.be.true.andCheck();
                ac.check(done);
            });
        });

        describe('Router#on(url, cb)', function () {
            it('should throw an error if url does not start with `/`', function (done) {
                var url = 'some-url';

                (function(){
                    router.on(url, cb)
                }).should.throw(url + ' is not a valid URL. Valid URLs must start with /');

                ac.check(done);
            });

            it('should not throw an error if url does start with `/`', function (done) {
                var url = '/some-url';

                (function(){
                    router.on(url, cb)
                }).should.not.throw(url + ' is not a valid URL. Valid URLs must start with /');

                ac.check(done);
            });

            it('should return an instance of EventEmitter2 for correct url', function (done) {
                ac.expect(1);
                router.on('/some-url', cb).should.be.an.instanceOf(EventEmitter2).andCheck();
                ac.check(done);
            });
        });
    });
});