'use strict';

var path    = require('path'),
  ss      = require( '../../fixtures/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient'),
  fixtures = require('../../fixtures');


describe('Template engine', function() {

  var sinon = require('sinon');
  ss.root = ss.api.root = fixtures.project;

  options.liveReload = false;

  describe('builtin use', function() {

    beforeEach(function() {
      ss.client.reset();
    });

    it('should throw error for unknown builtin engine', function() {

      defineAbcClient({ },function() {
        // jshint immed: false
        (function() {
          ss.client.templateEngine.use('not-there');
        }).should.throw('The not-there template engine is not supported by SocketStream internally'+
          ' or found in the project packages. Please pass a compatible module instead');
      });
    });

    // dropped the requirement
    //it('should throw error for module use', function() {
    //
    //  // jshint immed: false
    //  (function() {
    //    defineAbcClient({ },function() {
    //      ss.client.templateEngine.use('angular','my-module');
    //    });
    //  }).should.throw('Directory name \'my-module\' passed to second argument of ss.client.templateEngine.use() command must start with / or ./');
    //});
  });

  describe('custom use', function() {

    var oldEngine = {
      init: function(api, config) {
        api.should.equal(ss.api);
        return {
          name: 'Old',
          selectFormatter: function() {
            return null;
          },
          process: function (template, path, id) {
            return '<script id="old-' + id + '" type="text/x-tmpl"><!-- ' + config.comment + ' -->' + template + '</script>';
          }
        }
      }
    };

    var newEngine = function newEngine(api,config,options) {
      api.should.equal(ss.api);
      options.should.equal(ss.client.options);
      return {
        name: 'New',
        process: function (template, path, id) {
          return '<script id="new-' + id + '" type="text/x-tmpl"><!-- ' + config.comment + ' -->' + template + '</script>';
        }
      }
    };

    newEngine = sinon.spy(newEngine);

    beforeEach(function() {
      ss.client.reset();
    });

    it('should wrap with old API custom engine process function', function(done) {

      sinon.spy(oldEngine, 'init');

      defineAbcClient({ },function() {
        ss.client.templateEngine.use(oldEngine,'.',{comment:'123'});
      });

      sinon.assert.calledOnce(oldEngine.init);

      var bundler = ss.api.bundler.get('abc');

      var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

      ss.client.templateEngine.generate(bundler, files, function (tag) {
        tag.should.be.equal('<script id="old-1" type="text/x-tmpl"><!-- 123 --><body><div>1</div></body>\n</script>');
        done();
      });
    });

    it('should wrap with new API custom engine process function', function(done) {

      defineAbcClient({ },function() {
        ss.client.templateEngine.use(newEngine,'.',{comment:'1243'});
      });

      sinon.assert.calledOnce(newEngine);

      var bundler = ss.api.bundler.get('abc');

      var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

      ss.client.templateEngine.generate(bundler, files, function (tag) {
        tag.should.be.equal('<script id="new-1" type="text/x-tmpl"><!-- 1243 --><body><div>1</div></body>\n</script>');
        done();
      });
    });

    it('should wrap with old API custom engine selectFormatter function');
    /*TODO
    it('should wrap with old API custom engine selectFormatter function', function(done) {

      sinon.spy(oldEngine, 'init');

      defineAbcClient({ },function() {
        ss.client.templateEngine.use(oldEngine,'.',{comment:'123'});
      });

      sinon.assert.calledOnce(oldEngine.init);


      var files = [
        {file: 'templates/1.html', importedBy: 'templates/1.html', includeType: 'html'}
      ];

      var bundler = ss.api.bundler.get('abc');

      ss.client.templateEngine.generate(bundler, files, function (tag) {
        tag.should.be.equal('<script id="old-1" type="text/x-tmpl"><!-- 123 --><body><div>1</div></body>\n</script>');
        done();
      });
    });
    */

    it('should append suffix');

    it('should prepend prefix');

    it('should catch and pass error object');

    it('should suggest good default IDs');
  });
});
