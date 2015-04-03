'use strict';

var path    = require('path'),
  vm      = require('vm'),
  fs      = require('fs'),
  should  = require('should'),
  ss      = require( '../../../../lib/socketstream');

/**
 * directories are defined with a trailing /
 * JS and Coffee files are defined without
 * Code should not be registered with their extension
 *
 *
 * resolve:
 require(X) from module at path Y
 1. If X is a core module,
 a. return the core module
 b. STOP
 2. If X begins with './' or '/' or '../'
 a. LOAD_AS_FILE(Y + X)
 b. LOAD_AS_DIRECTORY(Y + X)
 3. not relevant: LOAD_NODE_MODULES(X, dirname(Y))
 4. THROW "not found"

 LOAD_AS_FILE(X)
 1. If X is a file, load X as JavaScript text.  STOP
 2. If X.js is a file, load X.js as JavaScript text.  STOP
 3. If X.json is a file, parse X.json to a JavaScript Object.  STOP
 4. If X.node is a file, load X.node as binary addon.  STOP

 LOAD_AS_DIRECTORY(X)
 1. If X/package.json is a file,
 a. Parse X/package.json, and look for "main" field.
 b. let M = X + (json main field)
 c. LOAD_AS_FILE(M)
 2. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
 3. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
 4. If X/index.node is a file, load X/index.node as binary addon.  STOP
 */
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

    it('should have a functioning require.modules.path.resolve',function() {
      var bPath = browser.require.modules.path();

      bPath.resolve('/').should.be.equal('/');
      bPath.resolve('abc/def','./ghi').should.be.equal('abc/def/ghi');
      bPath.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile').should.be.equal('/tmp/subfile');
      bPath.resolve('/a/b','c/index').should.be.equal('/a/b/c/index');
    });

    it('should have functioning require.modules.path.dirname',function() {
      var bPath = browser.require.modules.path();

      bPath.dirname('/a/b/c/d').should.be.equal('/a/b/c');
      //bPath.dirname('/a/b/c/d/').should.be.equal('/a/b/c/d');
    });

    it('should resolve /index directly or indirectly', function() {
      browser.require.define('/a/b/c/d',
        function(/*require, module, exports, __dirname, __filename*/) {
        }
      );

      browser.require.define('/a/b/c/index',
        function(/*require, module, exports, __dirname, __filename*/) {
        }
      );

      browser.require.define('builtin/e',
        function(/*require, module, exports, __dirname, __filename*/) {
        }
      );

      browser.require.define('builtin/index',
        function(/*require, module, exports, __dirname, __filename*/) {
        }
      );

      browser.require.resolve('/a/b/c/index').should.equal('/a/b/c/index');
      browser.require.resolve('./a/b/c/index').should.equal('/a/b/c/index');
      browser.require.resolve('../a/b/c/index','/other').should.equal('/a/b/c/index');
      browser.require.resolve('/a/b/c').should.equal('/a/b/c/index');
      browser.require.resolve('/a/b/c/').should.equal('/a/b/c/index');

      browser.require.resolve('/c/index','/a/b').should.equal('/a/b/c/index');
      browser.require.resolve('/c','/a/b').should.equal('/a/b/c/index');
      browser.require.resolve('/c/','/a/b').should.equal('/a/b/c/index');

      browser.require.resolve('builtin/index').should.equal('builtin/index');

      browser.require.resolve('builtin/index','/a/b').should.equal('builtin/index');
    });

    it('should resolve require with absolute path', function() {
      browser.require.define('/a/b/c/d',
        function(require, module, exports, __dirname, __filename) {
          exports.a = 'a';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      var r = browser.require('/a/b/c/d');
      r.a.should.equal('a');
      r.dirname.should.equal('/a/b/c');
      r.filename.should.equal('/a/b/c/d');
    });

    it('should resolve require of module', function() {
      browser.require.define('mod-a',
        function(require, module, exports, __dirname, __filename) {
          exports.b = 'b';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      var r = browser.require('mod-a');
      r.b.should.equal('b');
      r.dirname.should.equal('.');
      r.filename.should.equal('mod-a');
    });

    it('should resolve require of sub-module', function() {
      browser.require.define('mod-a/sub-mod',
        function(require, module, exports, __dirname, __filename) {
          exports.c = 'c';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      var r = browser.require('mod-a/sub-mod');
      r.c.should.equal('c');
      r.dirname.should.equal('mod-a');
      r.filename.should.equal('mod-a/sub-mod');
    });

    it('should resolve require of a relative path');

    it('should resolve the entry module');

    xit('should resolve relative require within an absolute module',function() {

      browser.require.define('/a/b/c/d',
        function(require, module, exports, __dirname, __filename) {
          exports.f = 'f';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      browser.require.define('/a/b/c/index',
        function(require, module, exports, __dirname, __filename) {
          exports.g = 'g';
          exports.dirname = __dirname;
          exports.filename = __filename;
          exports.d = require('./d');
        }
      );

      var sub = browser.require('/a/b/c/d');
      sub.f.should.equal('f');
      sub.dirname.should.equal('/a/b/c');
      sub.filename.should.equal('/a/b/c/d');

      // sub-module in main
      var main = browser.require('/a/b/c');
      should(main).not.be.equal(undefined);
      main.dirname.should.equal('/a/b/c');
      main.filename.should.equal('/a/b/c/index');
      main.g.should.equal('g');
      should(main.d).equal(sub);
    });

    it('should resolve relative require within an absolute sibling module',function() {

      browser.require.define('/a/b/c/d',
        function(require, module, exports, __dirname, __filename) {
          exports.f = 'f';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      browser.require.define('/a/b/c/x',
        function(require, module, exports, __dirname, __filename) {
          exports.g = 'g';
          exports.dirname = __dirname;
          exports.filename = __filename;
          exports.d = require('./d');
        }
      );

      var sub = browser.require('/a/b/c/d');
      sub.f.should.equal('f');
      sub.dirname.should.equal('/a/b/c');
      sub.filename.should.equal('/a/b/c/d');

      // sub-module in main
      var main = browser.require('/a/b/c/x');
      main.g.should.equal('g');
      main.dirname.should.equal('/a/b/c');
      main.filename.should.equal('/a/b/c/x');
      should(main.d).equal(sub);
    });

    it('should resolve module relative to a root', function() {

    });

    // Would this be a divergence from node require ?
    it('should resolve nested require of sub-module', function() {
      browser.require.define('mod-a/index',
        function(require, module, exports, __dirname, __filename) {
          exports.b = 'b';
          exports.dirname = __dirname;
          exports.filename = __filename;
          exports.sub = require('./sub-mod');
        }
      );
      browser.require.define('mod-a/sub-mod',
        function(require, module, exports, __dirname, __filename) {
          exports.c = 'c';
          exports.dirname = __dirname;
          exports.filename = __filename;
        }
      );

      var sub = browser.require('mod-a/sub-mod');
      sub.c.should.equal('c');
      sub.dirname.should.equal('mod-a');
      sub.filename.should.equal('mod-a/sub-mod');

      // sub-module in main
      var main = browser.require('mod-a');
      main.dirname.should.equal('mod-a');
      main.filename.should.equal('mod-a/index');
      should(main.sub).equal(sub);
    });

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
