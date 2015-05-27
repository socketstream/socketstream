'use strict';



// Dependencies
//
var assert  = require('assert');
var path    = require('path');
var index   = require('../../../lib/request/index');



describe('index()', function () {

  it('should return an object with add, load, and clear functions', function (done) {

    var ss          = {root:'/some/path'};
    var loadedIndex = index(ss);
    assert(typeof loadedIndex === 'object');
    assert(typeof loadedIndex.add === 'function');
    assert(typeof loadedIndex.load === 'function');
    assert(typeof loadedIndex.clear === 'function');
    done();

  });

  describe('clear()', function () {

    it('should set default middleware to false, so that they are not loaded', function (done) {

      var ss          = {root:'/some/path'};
      var loadedIndex = index(ss);
      assert.equal(false,loadedIndex.clear());
      assert.deepEqual(loadedIndex.load(), {});
      done();

    });

  });

  describe('load()', function () {

    it('should load the events and rpc responders by default', function (done) {

      var ss          = {root: path.join(__dirname,'../../../','new_project'), client: {send: function () {}}};
      var loadedIndex = index(ss);
      var fullLoad    = loadedIndex.load();
      assert.deepEqual(fullLoad['0'].name, 'events');
      assert.deepEqual(fullLoad['1'].name, 'rpc');
      assert(typeof fullLoad['0'].interfaces.websocket === 'function');
      assert(typeof fullLoad['1'].interfaces.websocket === 'function');
      assert(typeof fullLoad['1'].interfaces.internal === 'function');
      done();

    });

  });

  describe('add()', function () {

    describe('when given a name of a request responder', function () {

      it('should load that request responder from inside of SocketStream\'s responders folder', function (done) {

        var ss          = {root: path.join(__dirname,'../../../','new_project'), client: {send: function () {}}};
        var loadedIndex = index(ss);
        var fullLoad    = loadedIndex.add('rpc');
        assert.equal(fullLoad.name,'rpc');
        assert(typeof fullLoad.interfaces === 'function');
        done();

      });

    });

    describe('when given a name of a request responder that does not exist', function () {

      it('should throw an error', function (done) {

        var ss          = {root: path.join(__dirname,'../../../','new_project'), client: {send: function () {}}};
        var loadedIndex = index(ss);
        assert.throws(function () {
          loadedIndex.add('webrtc');
        });
        done();

      });

    });

    describe('when given a function', function () {

      it('should load the function as a request responder', function (done) {

        var responderFunc = function () {
          return {
            name: 'customResponder',
            interfaces: function () {}
          }
        };
        var ss          = {root: path.join(__dirname,'../../../','new_project'), client: {send: function () {}}};
        var loadedIndex = index(ss);
        loadedIndex.clear();
        loadedIndex.add(responderFunc);
        var fullLoad = loadedIndex.load();
        assert.equal('customResponder',fullLoad['1'].name);
        done();

      });

    });

    describe('when given a function that has an error when invoked', function () {

      it('should throw an error', function (done) {

        var responderFunc = function () { throw new Error('An error occurred loading the responder'); };
        var ss          = {root: path.join(__dirname,'../../../','new_project'), client: {send: function () {}}};
        var loadedIndex = index(ss);
        loadedIndex.clear();
        assert.throws(function () {
          loadedIndex.add(responderFunc);
        });
        done();

      });

    });

  });

});
