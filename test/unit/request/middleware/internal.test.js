'use strict';

var logHook = require('../../../helpers/logHook.js'),
    fixtures = require('../../../fixtures'),
    chai = require('chai'),
    expect = chai.expect;

function loadInternal() {
  var api = {
    root: fixtures.project,
    log:require('../../../../lib/utils/log')
  };
  api.require = require('../../../../lib/utils/require')(api);
  api.session = require('../../../../lib/session')(api);

  return require('../../../../lib/request/middleware/internal')(api);
}

describe('internal()', function () {

  it('should return an object containing debug and session functions', function () {

    var loadedInternal = loadInternal();
    expect(loadedInternal).to.be.an('object');
    expect(loadedInternal.debug).to.be.an('function');
    expect(loadedInternal.session).to.be.a('function');
  });


  describe('#debug', function () {

    describe('when no color is passed', function () {

      it('should return a function that logs a request with the color yellow', function (done) {
        var _logs;
        logHook.on();
        var loadedInternal  = loadInternal();
        var debugFunc       = loadedInternal.debug();
        expect(debugFunc).to.be.a('function');
        var fakeReq   = {};
        var fakeRes   = {};
        function fakeNext() {
          _logs = logHook.off();
          expect(_logs).to.eql(['\u001b[33mDebug incoming message >>\n\u001b[39m {}']);
          done();
        }
        debugFunc(fakeReq,fakeRes,fakeNext);

      });

    });


    describe('when a color is passed', function () {

      it('should return a function that logs a request with given color', function (done) {
        var _logs;
        logHook.on();
        var loadedInternal  = loadInternal();
        var debugFunc       = loadedInternal.debug('blue');
        expect(debugFunc).to.be.a('function');
        var fakeReq   = {};
        var fakeRes   = {};
        var fakeNext  = function () {
          _logs = logHook.off();
          expect(_logs).to.eql(['\u001b[34mDebug incoming message >>\n\u001b[39m {}']);
          done();
        }
        debugFunc(fakeReq,fakeRes,fakeNext);

      });

    });

  });

  describe('#session', function () {

    describe('with no options passed', function () {

      it('should return a function that finds the session for the request', function () {

        var loadedInternal  = loadInternal();
        var sessionFunc     = loadedInternal.session();
        expect(sessionFunc).to.be.a('function');
      });

    });

    describe('when the request does not contain a session id', function () {

      it('should throw an error', function () {

        var loadedInternal  = loadInternal();
        var sessionFunc     = loadedInternal.session();
        expect(sessionFunc).to.be.a('function');
        var fakeReq = {};
        var fakeRes = {};
        var fakeNext = function () { return null; };
        expect(function () {
          sessionFunc(fakeReq,fakeRes,fakeNext);
        }).to.throw();
      });

    });

    describe('when the request contains an invalid session id', function () {

      it('should call next as session will create a new session in its place', function (done) {
        var loadedInternal  = loadInternal();
        var sessionFunc     = loadedInternal.session();
        expect(sessionFunc).to.be.a('function');
        var fakeReq = {sessionId: '309eu2e0', socketId: '29j9j2s9j'};
        var fakeRes = {};
        sessionFunc(fakeReq,fakeRes,done);

      });

    });

  });

});
