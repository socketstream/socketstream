/*jshint immed: false */

'use strict';

var path          = require('path'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    Router        = require( '../../../lib/http/router').Router,
    req           = {},
    res           = {},
    cb,
    router;

describe('lib/http/router', function () {

    beforeEach(function (done) {
        router = new Router();

        cb = function() {
            return;
        }

        done();
    });

    it('should exports `Router` as a function', function (done) {

        Router.should.be.type('function');
        done();
    });

    describe('Router()', function () {

        it('should be an object', function (done) {
            router.should.be.type('object');
            done();
        });

        it('should have an object property #ee', function (done) {
            router.should.have.a.property('ee').with.a.type('object');
            done();
        });

        it('should have a function property #on', function (done) {
            router.should.have.a.property('on').with.a.type('function');
            done();
        });

        it('should have a function property #route', function (done) {
            router.should.have.a.property('route').with.a.type('function');
            done();
        });

        describe('Router#ee', function () {
            it('should be an instance of EventEmitter2', function (done) {
                router.ee.should.be.an.instanceOf(EventEmitter2);
                done();
            });

            it('should have an empty object property #_events', function (done) {
                router.ee.should.have.a.property('_events').with.a.type('object');
                router.ee._events.should.eql({});
                done();
            });

            it('should have a string property #delimiter = ?', function (done) {
                router.ee.should.have.a.property('delimiter', '?').with.a.type('string');
                done();
            });

            it('should have a boolean property #wildcard = true', function (done) {
                router.ee.should.have.a.property('wildcard', true).with.a.type('boolean');
                done();
            });

            it('should have an empty object property #listenerTree', function (done) {
                router.ee.should.have.a.property('listenerTree').with.a.type('object');
                router.ee.listenerTree.should.eql({});
                done();
            });
        });

        describe('Router#route(url, req, res)', function () {
            it('should return false for `/` if there are no routes and no listners', function (done) {
                router.route('/', req, res).should.eql(false);
                done();
            });

            it('should return true for `/` if there is a listner for `/`', function (done) {
                router.on('/', cb);
                router.route('/', req, res).should.eql(true);
                done();
            });

            it('should return false for `/` if there is a listner for `/404`', function (done) {
                router.on('/404', cb);
                router.route('/', req, res).should.eql(false);
                done();
            });

            it('should return false for `/200` if there is a listner for `/404`', function (done) {
                router.on('/404', cb);
                router.route('/200', req, res).should.eql(false);
                done();
            });

            it('should return false for an empty url', function (done) {
                router.on('/404', cb);
                router.route('', req, res).should.eql(false);
                done();
            });

            it('should support Push State Routing', function (done) {
                router.on('/', cb);

                router.route('/1', req, res).should.eql(true);
                router.route('/1/', req, res).should.eql(true);
                router.route('/1/2', req, res).should.eql(true);
                router.route('/1/2/3', req, res).should.eql(true);
                router.route('/1/2/3/4', req, res).should.eql(true);
                done();
            });

            it('should return true if the url request contains parameters', function (done) {
                router.on('/some-url', cb);
                router.route('/some-url?ts=12345', req, res).should.eql(true);
                router.route('/some-url/?ts=12345', req, res).should.eql(true);
                done();
            });

            /**
             * test for #286 Static file error with 404
             * https://github.com/socketstream/socketstream/pull/419
             */
            it('should return false for static file and true for Push State Routing', function (done) {
                router.on('/', cb);

                router.route('/content/uploads/345.jpg', req, res).should.eql(false);
                router.route('/content/uploads/', req, res).should.eql(true);
                router.route('/content', req, res).should.eql(true);
                router.route('/', req, res).should.eql(true);
                router.route('', req, res).should.eql(true);
                done();
            });
        });

        describe('Router#on(url, cb)', function () {
            it('should throw an error if url does not start with `/`', function (done) {
                var url = 'some-url';

                (function(){
                    router.on(url, cb)
                }).should.throw(url + ' is not a valid URL. Valid URLs must start with /');

                done();
            });

            it('should not throw an error if url does start with `/`', function (done) {
                var url = '/some-url';

                (function(){
                    router.on(url, cb)
                }).should.not.throw(url + ' is not a valid URL. Valid URLs must start with /');

                done();
            });

            it('should return an instance of EventEmitter2 for correct url', function (done) {
                router.on('/some-url', cb).should.be.an.instanceOf(EventEmitter2);
                done();
            });
        });
    });
});
