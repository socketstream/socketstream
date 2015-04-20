'use strict';

var path    = require('path'),
    ss      = require( '../../../../lib/socketstream'),
    options = ss.client.options;

describe('bundler', function () {

  //TODO set project root function

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  options.liveReload = false;

  describe('API',function() {

    afterEach(function() {
      ss.client.forget();
    });

    it('should resolve paths in default dirs',function() {
      var paths = ss.api.bundler.sourcePaths({
        css: 'main.css',
        code: 'main.js',
        tmpl: 'main.html'
      });

      paths.css.should.eql(['./css/main.css']);
      paths.code.should.eql(['./code/main.js']);
      paths.tmpl.should.eql(['./templates/main.html']);
    });

    it('should return bundler given id', function() {
      var client = ss.client.define('abc', { view: 'abc.html' });

      var bundler = ss.api.bundler.get({ client: 'abc' });
      bundler.should.be.type('object');
      bundler.client.should.equal(client);
    });

    it('should look up bundler by id', function() {
      var client = ss.client.define('abc', { view: 'abc.html' });

      var bundler = ss.api.bundler.get({ ts: client.id });
      bundler.should.be.type('object');
      bundler.client.should.equal(client);
    });

    it('should throw odd bundler lookups', function() {
      ss.client.define('abc', { view: 'abc.html' });

      // jshint immed: false
      (function() {
        ss.api.bundler.get({ ts: 'abc' });
      }).should.throw(Error);
    });

    it('should throw if defined twice', function() {
      ss.client.define('abc', { view: 'abc.html' });

      // jshint immed: false
      (function() {
        ss.client.define('abc', { view: 'abc.html' });
      }).should.throw(Error);
    });

    it('should set client options piecemeal', function() {
      ss.client.set({ 'a':'a'});
      options.a.should.equal('a');
      ss.client.set({ 'b':'b'});
      options.b.should.equal('b');
      ss.client.set({ 'b':'B'});
      options.b.should.equal('B');
    });

    it('should provides systemModules');

    it('should provide systemModule by name, wrapped or not');
  });

  describe('custom bundlers', function() {

    it('should define client using custom bundler function');

    it('should call load and unload bundler');

  });


  describe('entries', function() {

    afterEach(function() {
      ss.client.forget();
    });

    it('should identify css explicitly defined');

    it('should identify css defined using /*');

    it('should identify js explicitly defined');

    it('should identify js defined using /*');

    it('should identify single template defined', function() {
      var client = ss.client.define('abc',{
        view: 'main2.html',
        css: 'main.css',
        code: 'main.js',
        tmpl: 'main.html'
      });

      ss.api.bundler.load();

      ss.api.client.templateEngines = ss.client.templateEngine.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var templates = ss.api.bundler.entries(client,'tmpl');
      templates.should.eql([{
        file: './templates/main.html', importedBy: './templates/main.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html'
      }]);


    });

    it('should identify multiple templates explicitly defined', function() {
      var client = ss.client.define('abc2',{
        view: 'main2.html',
        css: 'main.css',
        code: 'main.js',
        tmpl: ['main.html','abc/1.html','abc/2.html']
      });

      ss.api.bundler.load();

      ss.api.client.templateEngines = ss.client.templateEngine.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var templates = ss.api.bundler.entries(client,'tmpl');
      templates.should.eql([
        { file: './templates/main.html', importedBy: './templates/main.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html' },
        { file: './templates/abc/1.html', importedBy: './templates/abc/1.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html' },
        { file: './templates/abc/2.html', importedBy: './templates/abc/2.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html' }
      ]);
    });

    it('should identify templates using /*', function() {

      var client = ss.client.define('abc2',{
        view: 'main2.html',
        css: 'main.css',
        code: 'main.js',
        tmpl: 'abc/*'
      });

      ss.api.bundler.load();

      ss.api.client.templateEngines = ss.client.templateEngine.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var templates = ss.api.bundler.entries(client,'tmpl');
      templates.should.eql([
        { file: './templates/abc/1.html', importedBy: './templates/abc/1.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html' },
        { file: './templates/abc/2.html', importedBy: './templates/abc/2.html', includeType: 'html', ext:'html', bundle:'tmpl', assetType:'html' }
      ]);
    });

  });

});
