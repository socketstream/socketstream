'use strict';

var path    = require('path'),
  vm      = require('vm'),
  fs      = require('fs'),
  should  = require('should'),
  ss      = require( '../../../../lib/socketstream'),
  options = ss.client.options;

describe('browserify', function() {

  var browserify = fs.readFileSync( path.join(__dirname,'../../../..', 'lib/client/system/libs/browserify.js')),
      browser;

  describe('require()', function () {

    beforeEach(function() {
      browser = (function(){
        var window = {document:{}};
        window.window = window;
        vm.runInNewContext(browserify, window);

        return window;
      })();
    });

    it('should be sane',function() {
      should(browser.require).be.type('function');
    });

    it('should resolve require with absolute path', function() {
      browser.require.define('/a/b/c/d',
        function(require, module, exports, __dirname, __filename) {
          exports.a = 'a';
        }
      );

      var d = browser.require('/a/b/c/d');
      d.a.should.equal('a');
    });

    it('should resolve require of module');

    it('should resolve require of a relative path');

    it('should resolve the entry module');

    it('should resolve relative require within a module');

    //require.define("./code/discuss/entry", function (require, module, exports, __dirname, __filename){


  });

  describe('process', function() {

    beforeEach(function() {
      browser = (function(){
        var window = {document:{}};
        window.window = window;
        vm.runInNewContext(browserify, window);

        return window;
      })();
    });
    it('should support process.nextTick across windows');

  });

  describe('builtin modules', function() {

    beforeEach(function() {
      browser = (function(){
        var window = {document:{}};
        window.window = window;
        vm.runInNewContext(browserify, window);

        return window;
      })();
    });
    it('should support path');

    it('should support events');

    it('should support vm');

    it('should support assert');

    it('should support fs');
  });

});
