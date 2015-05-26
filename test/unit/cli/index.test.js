'use strict';



// Dependencies
//
var assert      = require('assert');
var Gently      = require('gently');
var generator   = require('../../../lib/cli/generate.js');
var index       = require('../../../lib/cli/index.js');
var gently      = new Gently();



describe('/index.js', function () {



  describe('#process', function () {



    describe('when the 1st argument is n', function () {

      it('should call the generator with the program arguments', function (done) {
        var program = {args: ['n', 'testapp']};
        gently.expect(generator, 'generate', function (receivedProgram) {
          assert.deepEqual(program,receivedProgram);
          done();
        });
        index.process(program);
      });

    });



    describe('when the 1st argument is new', function () {

      it('should call the generator with the program arguments', function (done) {
        var program = {args: ['new', 'testapp']};
        gently.expect(generator, 'generate', function (receivedProgram) {
          assert.deepEqual(program,receivedProgram);
          done();
        });
        index.process(program);
      });

    });



    describe('when the 1st argument is neither "n" or "new"', function () {

      it('should inform the user on how to use the application', function (done) {
        var program = {args: ['create', 'testapp']};
        gently.expect(console, 'log', function (string) {
          assert.deepEqual('Type "socketstream new <projectname>" to create a new application',string);
          done();
        });
        index.process(program);
      });

    });



  });



});
