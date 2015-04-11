'use strict';

var ss      = require( '../../../lib/socketstream'),
  defineAbcClient = require('./abcClient');


  describe('code formatter loading API', function () {

    var sinon = require('sinon')

    describe('ss api', function() {

      it('should throw exception when called as function');
    });

    describe('#add', function () {


      beforeEach(function() {

        // back to initial client state
        ss.client.assets.unload();
        ss.client.assets.load();
      });

      afterEach(function() {
        ss.client.forget();
      });

      it('should append a module from built-in directory',function() {
        ss.client.formatters.add('css');
        ss.client.formatters.add('javascript');
        ss.client.formatters.add('html');

        // load
        ss.api.bundler.load();
        var loaded = ss.api.client.formatters = ss.client.formatters.load();

        loaded.css.should.be.type('object');
        loaded.css.assetType.should.be.equal('css');
        loaded.css.contentType.should.be.equal('text/css');
        loaded.css.compile.should.be.type('function');

        loaded.js.should.be.type('object');
        loaded.js.assetType.should.be.equal('js');
        loaded.js.contentType.should.be.equal('text/javascript; charset=utf-8');
        loaded.js.compile.should.be.type('function');

        loaded.html.should.be.type('object');
        loaded.html.assetType.should.be.equal('html');
        loaded.html.contentType.should.be.equal('text/html');
        loaded.html.compile.should.be.type('function');
      });


      it('should append a module for handling a code format (new API)',function() {

        var formatter = function (api, config) {
            api.should.equal(ss.api);
            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              root: api.root,
              compile: function (pathEntry, options, cb) {
                cb('//');
              }
            };
        };

        ss.client.formatters.add(formatter, {c:'c'});

        // load
        ss.api.bundler.load();
        var loaded = ss.api.client.formatters = ss.client.formatters.load();

        var concrete = loaded.a;
        concrete.root.should.be.equal(ss.api.root);
        concrete.should.be.type('object');
        concrete.name.should.equal('f1');
        concrete.config.c.should.equal('c');
      });

      it('should append a module for handling a code format (old API)',function() {

        var formatter = {
          init: function (root, config) {

            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              compile: function (pathEntry, options, cb) {
                cb('//');
              }
            };
          }
        };

        ss.client.formatters.add(formatter, {c:'c'});

        // load
        ss.api.bundler.load();
        var loaded = ss.api.client.formatters = ss.client.formatters.load();

        var concrete = loaded.a;
        concrete.should.be.type('object');
        concrete.name.should.equal('f1');
        concrete.config.c.should.equal('c');
      });



      it('should throw an error if the formatter is not supported by SocketStream internally', function() {
        // jshint immed: false
        (function() {
          ss.client.formatters.add('not-there',{});

        }).should.throw('The not-there formatter is not supported by SocketStream internally. Please pass a compatible module instead');
      });

    });



    describe('#load', function () {

      beforeEach(function() {

        // back to initial client state
        ss.client.assets.unload();
        ss.client.assets.load();
      });

      afterEach(function() {
        ss.client.forget();
      });

      it('should load the code formatters, and return an object containing them', function() {

          ss.client.define('abc', {
            css: './abc/style.css',
            code: './abc/index.a',
            view: './abc/abc.html'
          });

          var formatter = {
            init: function (root, config) {

              return {
                name: 'f1',
                extensions: ['a', 'b'],
                assetType: 'js',
                contentType: 'text/javascript; charset=utf-8',
                config: config,
                compile: function (pathEntry, options, cb) {
                  cb('//');
                }
              };
            }
          };

          ss.client.formatters.add(formatter,{'c':'c'});

          // load
          ss.api.bundler.load();
          ss.api.client.formatters = ss.client.formatters.load();

          ss.api.client.formatters.should.be.type('object');
          var concrete = ss.api.client.formatters.a;
          ss.api.client.formatters.b.should.be.equal(concrete);
          concrete.should.be.type('object');
          concrete.name.should.equal('f1');
          concrete.config.c.should.equal('c');
        });

    });


    describe('#call',function() {
      beforeEach(function() {

        // back to initial client state
        ss.client.assets.unload();
        ss.client.assets.load();
      });

      afterEach(function() {
        ss.client.forget();
      });

      it('should forward exceptions returned', function(done) {

        var formatter = {
          init: function (root, config) {

            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              compile: function (pathEntry, options, cb) {
                cb(new Error(config.c));
              }
            };
          }
        };

        ss.client.formatters.add(formatter,{'c':'c'});

        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        ss.api.client.formatters.should.be.type('object');
        var concrete = ss.api.client.formatters.a,
            resolve = sinon.spy(),
            reject = sinon.spy(function(err) {
              err.message.should.be.equal('c');
              done();
            });
        concrete.call('abc/def.a',{}, resolve, reject);
        //resolve.calledWith().should.equal(false);
        //resolve.calledWith({message:''}).should.equal(true);
        sinon.assert.notCalled(resolve);
        sinon.assert.calledOnce(reject);
      });

      it('should forward exceptions thrown', function(done) {

        var formatter = {
          init: function (root, config) {

            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              compile: function () {
                throw new Error(config.c);
              }
            };
          }
        };

        ss.client.formatters.add(formatter,{'c':'c'});

        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        ss.api.client.formatters.should.be.type('object');
        var concrete = ss.api.client.formatters.a,
          resolve = sinon.spy(),
          reject = sinon.spy(function(err) {
            err.message.should.be.equal('c');
            done();
          });
        concrete.call('abc/def.a',{},resolve,reject);
        sinon.assert.notCalled(resolve);
        sinon.assert.calledOnce(reject);
      });

      it('should format JavaScript comment',function() {

        var formatter = {
          init: function (root, config) {

            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              compile: function (pathEntry, options, cb) {
                cb('//'+config.c);
              }
            };
          }
        };

        ss.client.formatters.add(formatter,{'c':'c'});

        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        ss.api.client.formatters.should.be.type('object');
        var concrete = ss.api.client.formatters.a;
        var output;
        concrete.call('abc/def.a',{},function(out) {
          output = out;
          out.should.be.equal('//c');
        });
      });
    });

  describe('application',function() {

    var view = require('../../../lib/client/view');

    beforeEach(function() {

      ss.client.assets.unload();
      ss.client.assets.load();
    });

    afterEach(function() {
      ss.client.unload();
      ss.client.forget();
    });

    it('should serve view using custom formatter', function(done) {
      var client = defineAbcClient({
        view: '1.jade'
      },function() {
        ss.client.formatters.add('css');
        ss.client.formatters.add('javascript');
        ss.client.formatters.add('map');
        ss.client.formatters.add('html');
        ss.client.formatters.add(function() {
          return {
            name: 'Jade',
            extensions: ['jade'],
            assetType: 'html',
            contentType: 'text/html',
            compile: function (pathEntry, options, cb) {
              cb('<body>Jade</body>');
            }
          };
        });

      });

      var options = {},
          expectedHtml = '<body>Jade<script>require("/abc/index");</script></body>';

      view(ss.api, client, options, function(output) {
        output.should.equal(expectedHtml);
        done();
      });
    });

  });

});
