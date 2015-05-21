'use strict';



// Dependencies
//
var assert            = require('assert'),
    transport         = require('../../../lib/publish/transport');



describe('lib/publish/transport', function () {



  describe('()', function () {



    it('should return an object with 2 functions - use and load', function (done) {

      var initialisedTransport = transport();
      assert(typeof initialisedTransport === 'object');
      assert(typeof initialisedTransport.use === 'function');
      assert(typeof initialisedTransport.load === 'function');
      done();

    });



    describe('#use', function () {



      describe('when no config is passed', function () {



        it('should set the config to an empty object', function (done) {

          var myConfig = {};

          var myCustomTransport = function (config) {
            assert.deepEqual(myConfig,config);
            done();
          };

          var initialisedTransport = transport();
          initialisedTransport.use(myCustomTransport);
          initialisedTransport.load();

        });



      });



      describe('when a config is passed', function () {



        it('should set the config to the config passed', function (done) {

          var myConfig = {host: 'nosql-server.com', port: 8929};

          var myCustomTransport = function (config) {
            assert.deepEqual(myConfig,config);
            done();
          };

          var initialisedTransport = transport();
          initialisedTransport.use(myCustomTransport, myConfig);
          initialisedTransport.load();

        });



      });



    });



    describe('#use', function () {







      describe('when the internal transport is passed as a string', function () {



        it('should load the default internal transport option');



      });



      describe('when the redis transport is passed as a string', function () {



        it('should load the default redis transport option with the config');



      });



      describe('when a custom transport function is passed with configuration info', function () {



        it('should load the custom internal transport option with the config', function (done) {

          var myConfig = {host: 'nosql-server.com', port: 8929};

          var myCustomTransport = function (config) {
            assert.deepEqual(myConfig,config);
            done();
          };

          var initialisedTransport = transport();
          initialisedTransport.use(myCustomTransport, myConfig);
          initialisedTransport.load();

        });



      });



      describe('when a non-existent transport is passed', function () {



        it('should throw an error when the transport does not exist', function (done) {

          var initialisedTransport = transport();
          assert.throws(function () {
            initialisedTransport.use('nosql');
          });
          done();

        });



      });



    });



    describe('#load', function () {



      describe('when no transport is set beforehand', function () {



        it('should load the default internal transport');



      });



      describe('when a transport is set beforehand', function () {



        it('should load that transport instead', function (done) {

          var myCustomTransport = function () {
            done();
          };

          var initialisedTransport = transport();
          initialisedTransport.use(myCustomTransport);
          initialisedTransport.load();

        });



      });



    });



  });



});
