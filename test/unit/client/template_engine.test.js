'use strict';

var path    = require('path'),
  should  = require('should'),
  sinon   = require('sinon'),
  ss      = require( '../../../lib/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient');


describe('Template engine', function() {

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  options.liveReload = false;

  describe('custom use', function() {

    var oldEngine = {
      init: function(root, config) {
        root.should.equal(ss.root);
        return {
          name: 'Old',
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

      // back to initial client state
      ss.client.assets.unload();
      ss.client.assets.load();

      ss.client.formatters.add('html');
    });

    afterEach(function() {
      ss.client.unload();
      ss.client.forget();
    });

    it('should wrap with old API custom engine process function', function(done) {

      sinon.spy(oldEngine, 'init');

      defineAbcClient({ },function() {
        ss.client.templateEngine.use(oldEngine,'.',{comment:'123'});
      });

      sinon.assert.calledOnce(oldEngine.init);


      var files = [
        {file: './templates/1.html', importedBy: './templates/1.html', includeType: 'html'}
      ];

      var bundler = ss.api.bundler.get('abc');

      ss.client.templateEngine.generate(bundler, files, function (tag) {
        tag.should.be.equal('<script id="old-templates-1" type="text/x-tmpl"><!-- 123 --><body><div>1</div></body>\n</script>');
        done();
      });
    });

    it('should wrap with new API custom engine process function', function(done) {

      defineAbcClient({ },function() {
        ss.client.templateEngine.use(newEngine,'.',{comment:'1243'});
      });

      sinon.assert.calledOnce(newEngine);

      var files = [
        {file: './templates/1.html', importedBy: './templates/1.html', includeType: 'html'}
      ];

      var bundler = ss.api.bundler.get('abc');

      ss.client.templateEngine.generate(bundler, files, function (tag) {
        tag.should.be.equal('<script id="new-templates-1" type="text/x-tmpl"><!-- 1243 --><body><div>1</div></body>\n</script>');
        done();
      });
    });
  });
});
