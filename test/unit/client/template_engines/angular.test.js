'use strict';

var path    = require('path'),
  should  = require('should'),
//sinon   = require('sinon'),
  ss      = require( '../../../../lib/socketstream'),
  bundlerMod = require('../../../../lib/client/bundler'),
  //engineMod = require('../../../../lib/client/template_engine'),
  options = ss.client.options;

function defineAbcClient(conf) {
  var r = {
    css: './abc/style.css',
    code: './abc/index.js',
    view: './abc/abc.html',
    tmpl: './templates/abc/1.html'
  };
  for(var k in conf) r[k] = conf[k];
  return ss.client.define('abc',r);
}

function defineAbcClientAndLoad(conf,run) {
  var client = defineAbcClient(conf);
  run();
  ss.api.bundler.load();
  ss.api.client.templateEngines = ss.client.templateEngine.load();
  ss.api.client.formatters = ss.client.formatters.load();

  return client;
}

describe('angular.js template engine', function () {

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  options.liveReload = false;

  ss.api.bundler = bundlerMod(ss.api, options);

  //var templateEngine = engineMod(ss.api,options);

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


  it('should output an inline template when angular is used by default', function(done) {

    defineAbcClientAndLoad({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular');
    });

    var files = [
      {file: './templates/1.html', importedBy: './templates/1.html', includeType: 'html'}
    ];

    var bundler = ss.api.bundler.get('abc');

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="templates-1.html"><body><div>1</div></body>\n</script>');
      done();
    });
  });

  it('should output an inline template when angular is used by / default', function(done) {

    defineAbcClientAndLoad({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', '/');
    });

    var files = [
      {file: './templates/1.html', importedBy: './templates/1.html', includeType: 'html'}
    ];

    var bundler = ss.api.bundler.get('abc');

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="templates-1.html"><body><div>1</div></body>\n</script>');
      done();
    });
  });

  it('should output an inline template when angular is used by ./templates root', function(done) {

    defineAbcClientAndLoad({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', './templates');
    });

    var files = [
      {file: './templates/1.html', importedBy: './templates/1.html', includeType: 'html'}
    ];

    var bundler = ss.api.bundler.get('abc');

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="templates-1.html"><body><div>1</div></body>\n</script>');
      done();
    });
  });

  it('should output a regular template when angular is used by ./templates root', function(done) {

    defineAbcClientAndLoad({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', './templates');
    });

    var files = [
      {file: './abc/abc.html', importedBy: './abc/abc.html', includeType: 'html'}
    ];

    var bundler = ss.api.bundler.get('abc');

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script id="tmpl-abc-abc" type="text/x-tmpl"><html>\n<head><title>ABC</title></head>\n<body><p>ABC</p></body>\n</html></script>');
      done();
    });
  });

  it('should output an template when engine is tied to subpath within templates', function(done) {

    defineAbcClientAndLoad({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular','/abc');
    });

    var files = [
      { file: './templates/abc/1.html', importedBy:'./templates/abc/1.html', includeType:'html' }
    ];

    var files1 = [
      { file: './templates/1.html', importedBy:'./templates/1.html', includeType:'html' }
    ];

    var bundler = ss.api.bundler.get('abc');

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script type="text/ng-template" id="templates-abc-1.html"><div>abc 1</div>\n</script>');

      ss.client.templateEngine.generate(bundler, files1, function(tag) {
        tag.should.be.equal('<script id="tmpl-templates-1" type="text/x-tmpl"><body><div>1</div></body>\n</script>');
        done();
      });
    });
  });

});
