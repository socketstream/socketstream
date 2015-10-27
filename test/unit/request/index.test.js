'use strict';

var path = require('path'),
    ss = require( '../../fixtures/socketstream' ),
    chai = require('chai'),
    expect = chai.expect;


describe('request responder API', function () {

  beforeEach(function() {
    // ss.reset();
  });

  it('should return an object with add, load, and clear functions', function () {
    expect(ss.responders).to.be.an('object');
    expect(ss.responders.add).to.be.an('function');
    expect(ss.responders.load).to.be.an('function');
    expect(ss.responders.clear).to.be.an('function');
  });

  it('should set default middleware to false, so that they are not loaded', function () {
    expect(ss.responders.clear()).to.equal(false);
  });

  it('should load the events and rpc responders by default', function () {
    var responders = ss.responders.load();
    expect(responders['0'].name).to.equal('events');
    expect(responders['1'].name).to.equal('rpc');
    expect(responders['0'].interfaces.websocket).to.be.a('function');
    expect(responders['1'].interfaces.websocket).to.be.a('function');
    expect(responders['1'].interfaces.internal).to.be.a('function');
  });

  describe('when given a name of a request responder', function () {

    it('should load that request responder from inside of responders folder', function () {
      var loaded = ss.responders.add('rpc');
      expect(loaded.name).to.equal('rpc');
      expect(loaded.interfaces).to.be.a('function');
    });

    it('should throw an error if name unknown', function() {
      expect(function () {
        ss.responders.add('webrtc');
      }).to.throw();
    });
  });

  describe('when given a function for a request responder', function () {

    it('should load the request responder', function () {
      function responderFunc() {
        return {
          name: 'customResponder',
          interfaces: function () {}
        }
      }
      ss.responders.clear();
      ss.responders.add(responderFunc);
      var fullLoad = ss.responders.load();
      expect(fullLoad['6'].name).to.equal('customResponder'); // perhaps this could be a better behaviour just re-adding 'rpc'
    });

    it('should throw an error if constructor does', function () {
      function responderFunc() {
        throw new Error('An error occurred loading the responder');
      }
      ss.responders.clear();
      expect(function() {
        ss.responders.add(responderFunc);
      }).to.throw();
    });
  });
});
