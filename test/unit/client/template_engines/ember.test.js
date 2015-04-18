'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  options = ss.client.options;

describe('Ember.js template engine', function () {

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  options.liveReload = false;

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


  it('should output an inline template for use with Ember.js', function(done) {

    ss.client.define('abc', {
      css: './abc/style.css',
      code: './abc/index.a',
      view: './abc/abc.html'
    });

    ss.client.templateEngine.use('ember');

    ss.api.bundler.load();

    ss.api.client.templateEngines = ss.client.templateEngine.load();
    ss.api.client.formatters = ss.client.formatters.load();

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','./templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script type="text/x-handlebars" data-template-name="templates-1"><body><div>1</div></body>\n</script>');
      done();
    });

  });

});
