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

        var formatter = function (ss, config) {

            return {
              name: 'f1',
              extensions: ['a', 'b'],
              assetType: 'js',
              contentType: 'text/javascript; charset=utf-8',
              config: config,
              root: ss.root,
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
        should(function() {
          ss.client.formatters.add('not-there',{});

        }).throw(Error);
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

          var client = ss.client.define('abc', {
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

      it('should format JavaScript comment',function() {
        var client = ss.client.define('abc', {
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

    describe('#builtin formatters',function() {
      beforeEach(function() {

        // back to initial client state
        ss.client.assets.unload();
        ss.client.assets.load();
      });

      afterEach(function() {
        ss.client.forget();
      });

      it('should render style.css',function() {
        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        var concrete = ss.api.client.formatters.css;
        var output;
        concrete.call(path.join(__dirname,'../..','fixtures/project/client/abc/style.css'),{},function(out) {
          output = out;
          out.should.be.equal('/* style.css */\n');
        },function(err) {
          should(err).be.equal(undefined);
        });
      });

      it('should render index.js',function() {
        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        var concrete = ss.api.client.formatters.js;
        var output;
        concrete.call(path.join(__dirname,'../..','fixtures/project/client/abc/index.js'),{},function(out) {
          output = out;
          out.should.be.equal('// test\n');
        },function(err) {
          should(err).be.equal(undefined);
        });
      });

      it('should render index.map',function() {
        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        var concrete = ss.api.client.formatters.map;
        var output;
        concrete.call(path.join(__dirname,'../..','fixtures/project/client/abc/index.js'),{},function(out) {
          output = out;
          out.should.be.equal('// test\n');
        },function(err) {
          should(err).be.equal(undefined);
        });
      });

      it('should render ss.html',function() {
        // load
        ss.api.bundler.load();
        ss.api.client.formatters = ss.client.formatters.load();

        var concrete = ss.api.client.formatters.html;
        var output;
        concrete.call(path.join(__dirname,'../..','fixtures/project/client/abc/ss.html'),{},function(out) {
          output = out;
          out.should.be.equal('<html>\n<head><title>ABC</title><SocketStream/></head>\n<body><p>ABC</p></body>\n</html>\n');
        },function(err) {
          should(err).be.equal(undefined);
        });
      });

    });

});
