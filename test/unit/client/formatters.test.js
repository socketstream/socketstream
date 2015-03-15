'use strict';

var path    = require('path'),
  should  = require('should'),
  ss      = require( '../../../lib/socketstream'),
  options = ss.client.options;


  describe('code formatter loading API', function () {



    describe('#add', function () {


      beforeEach(function() {

        // back to initial client state
        ss.client.assets.unload();
        ss.client.assets.load();
      });

      afterEach(function() {
        ss.client.forget();
      });


      it('should append a module for handling a code format');



      it('should throw an error if the formatter is not supported by SocketStream internally', function() {
        should(function() {
          ss.client.formatters.add('not-there',{});

        }).throw(Error);
      });

    });



    describe('#load', function () {



        it('should load the code formatters, and return an object containing them');



    });



});
