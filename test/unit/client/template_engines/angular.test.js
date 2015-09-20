'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  bundlerMod = require('../../../../lib/client/bundler'),
  options = ss.client.options,
  defineAbcClient = require('../abcClient'),
  fixtures = require('../../../fixtures');


describe('angular.js template engine', function () {

  ss.root = ss.api.root = fixtures.project;

  ss.api.bundler = bundlerMod(ss.api, options);

  beforeEach(function() {
    ss.client.reset();
    ss.client.set({liveReload:false});
  });

  it('should output an inline template when angular is used by default', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular');
    });

    var bundler = ss.api.bundler.get('abc');
    var templates = bundler.entries('tmpl');
    templates.length.should.be.equal(1);

    ss.client.templateEngine.generate(bundler, templates, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="abc-1.html"><div>abc 1</div>\n</script>');
      done();
    });
  });

  it('should bundle up all templates', function(){

    defineAbcClient({
      code: './abc/index.a',
      tmpl: './templates'
    },function() {
      ss.client.templateEngine.use('angular');
    });

    var bundler = ss.api.bundler.get('abc');
    var templates = bundler.entries('tmpl');
    templates.length.should.be.equal(4);
  });

  it('should output an inline template when angular is used by / default', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', '/');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="1.html"><body><div>1</div></body>\n</script>');
      done();
    });
  });

  it('should output an inline template when angular is used by client/templates root', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', './templates');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="1.html"><body><div>1</div></body>\n</script>');
      done();
    });
  });

  it('should output a regular template when angular is used by client/templates root', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', './templates');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/abc/abc.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script id="tmpl-client-abc-abc" type="text/x-tmpl"><html>\n'+
        '<head><title>ABC</title></head>\n<body><p>ABC</p></body>\n</html>\n</script>');
      done();
    });
  });

  it('should output an template when engine is tied to subpath within templates', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular','/abc');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/abc/1.html') ];
    var files1 = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script type="text/ng-template" id="abc-1.html"><div>abc 1</div>\n</script>');

      ss.client.templateEngine.generate(bundler, files1, function(tag) {
        tag.should.be.equal('<script id="tmpl-1" type="text/x-tmpl"><body><div>1</div></body>\n</script>');
        done();
      });
    });
  });

  it('should output an template when engine is tied to subpath (relative path) within templates', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular','./templates/abc');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/abc/1.html') ];
    var files1 = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    // console.log('fake', files);

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script type="text/ng-template" id="abc-1.html"><div>abc 1</div>\n</script>');

      ss.client.templateEngine.generate(bundler, files1, function(tag) {
        tag.should.be.equal('<script id="tmpl-1" type="text/x-tmpl"><body><div>1</div></body>\n</script>');
        done();
      });
    });
  });

  it('should output angular templates in bundles when engine is tied to a relative subpath', function(done) {

    defineAbcClient({
      code: './abc/index.a' ,
      tmpl: './templates/abc'
    },function() {
      ss.client.templateEngine.use('angular','./templates/abc');
    });

    var bundler = ss.api.bundler.get('abc');
    var templates = bundler.entries('tmpl');
    templates.length.should.be.equal(2);

    ss.client.templateEngine.generate(bundler, templates, function(tag) {
      tag.should.be.equal('<script type="text/ng-template" id="abc-1.html"><div>abc 1</div>\n'+
'</script><script type="text/ng-template" id="abc-2.html"><div>abc 2</div>\n'+
'</script>');
      done();
    });
  });

  it('should output angular templates in bundles when engine is tied to a subpath, and defintion uses shorthand notation', function(done) {

    defineAbcClient({
      code: './abc/index.a' ,
      tmpl: 'abc'
    },function() {
      ss.client.templateEngine.use('angular','./templates/abc');
    });

    var bundler = ss.api.bundler.get('abc');
    var templates = bundler.entries('tmpl');
    templates.length.should.be.equal(2);

    // console.log('real',templates);

    ss.client.templateEngine.generate(bundler, templates, function(tag) {
      tag.should.be.equal('<script type="text/ng-template" id="abc-1.html"><div>abc 1</div>\n'+
'</script><script type="text/ng-template" id="abc-2.html"><div>abc 2</div>\n'+
'</script>');
      done();
    });
  });

  it('should output angular templates in bundles when tied to "."');

  it('should output angular templates in bundles when tied to "./client/templates"');

  it('should output an inline template when angular is used by more root', function(done) {

    defineAbcClient({ code: './abc/index.a' },function() {
      ss.client.templateEngine.use('angular', '../more');
    });

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','more/a/a.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script type="text/ng-template" id="more-a-a.html"><body><div>a</div></body>\n</script>');
      done();
    });
  });

});
