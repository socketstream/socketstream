'use strict';



// Dependencies
//
var assert    = require('assert');
var internal  = require('../../../../lib/request/middleware/internal');
var logHook   = require('../../../helpers/loghook.js');



describe('internal()', function () {

  it('should return an object containing debug and session functions', function (done) {

    var loadedInternal = internal();
    assert(typeof loadedInternal === 'object');
    assert(typeof loadedInternal.debug === 'function');
    assert(typeof loadedInternal.session === 'function');
    done();

  });


  describe('#debug', function () {

    describe('when no color is passed', function () {

      it('should return a function that logs a request with the color yellow', function (done) {
        var _logs;
        logHook.on();
        var loadedInternal  = internal();
        var debugFunc       = loadedInternal.debug();
        assert(typeof debugFunc === 'function');
        var fakeReq   = {};
        var fakeRes   = {};
        var fakeNext  = function () {
          _logs = logHook.off();
          assert(_logs[0] === '\u001b[33mDebug incoming message >>\n\u001b[39m {}');
          done();
        }
        debugFunc(fakeReq,fakeRes,fakeNext);

      });

    });


    describe('when a color is passed', function () {

      it('should return a function that logs a request with given color', function (done) {
        var _logs;
        logHook.on();
        var loadedInternal  = internal();
        var debugFunc       = loadedInternal.debug('blue');
        assert(typeof debugFunc === 'function');
        var fakeReq   = {};
        var fakeRes   = {};
        var fakeNext  = function () {
          _logs = logHook.off();
          assert(_logs[0] === '\u001b[34mDebug incoming message >>\n\u001b[39m {}');
          done();
        }
        debugFunc(fakeReq,fakeRes,fakeNext);

      });

    });

  });

  describe('#session', function () {

    describe('with no options passed', function () {

      it('should return a function that finds the session for the request', function (done) {

        var loadedInternal  = internal();
        var sessionFunc     = loadedInternal.session();
        assert(typeof sessionFunc === 'function');
        done();

      });

    });

    describe('when the request does not contain a session id', function () {

      it('should throw an error', function (done) {

        var loadedInternal  = internal();
        var sessionFunc     = loadedInternal.session();
        assert(typeof sessionFunc === 'function');
        var fakeReq = {};
        var fakeRes = {};
        var fakeNext = function () { return null; };
        assert.throws(function () {
          sessionFunc(fakeReq,fakeRes,fakeNext);
        });
        done();

      });

    });

    describe('when the request contains an invalid session id', function () {

      it('should call next as session will create a new session in its place', function (done) {
        var loadedInternal  = internal();
        var sessionFunc     = loadedInternal.session();
        assert(typeof sessionFunc === 'function');
        var fakeReq = {sessionId: '309eu2e0', socketId: '29j9j2s9j'};
        var fakeRes = {};
        sessionFunc(fakeReq,fakeRes,done);

      });

    });

  });

});
