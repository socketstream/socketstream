'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  options = ss.client.options,
  fixtures = require('../../../fixtures');

describe('Ember.js template engine', function () {

  ss.root = ss.api.root = fixtures.project;

  options.liveReload = false;

  beforeEach(function() {
    ss.client.reset();
    ss.client.set({liveReload:false});
  });

  it('should output an inline template for use with Ember.js', function(done) {

    ss.client.define('abc', {
      css: './abc/style.css',
      code: './abc/index.a',
      view: './abc/abc.html'
    });

    ss.client.templateEngine.use('ember');

    ss.client.load();

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','./templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script type="text/x-handlebars" data-template-name="1"><body><div>1</div></body>\n</script>');
      done();
    });

  });

});
