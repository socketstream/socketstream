'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  bundlerMod = require('../../../../lib/client/bundler'),
  engineMod = require('../../../../lib/client/template_engine'),
  options = ss.client.options,
  fixtures = require('../../../fixtures');

var os = require('os'), EOL = os.EOL;

describe('default template engine', function () {

  fixtures.setProject('project');

  ss.api.bundler = bundlerMod(ss.api, options);

  engineMod(ss.api,options);

  beforeEach(function() {
    ss.client.reset();
    ss.client.set({liveReload:false});
  });

  it('should output an inline template for use with jQuery or HoganJS', function(done) {

    ss.client.define('abc', {
        css: './abc/style.css',
        code: './abc/index.a',
        view: './abc/abc.html'
      });

    ss.client.load();

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script id="tmpl-1" type="text/x-tmpl"><body><div>1</div></body>' + EOL + '</script>');
      done();
    });

  });

  it('should output an inline template for a subpath', function(done) {

    ss.client.define('abc', {
      css: './abc/style.css',
      code: './abc/index.a',
      view: './abc/abc.html'
    });

    ss.client.load();

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/abc/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function(tag) {
      tag.should.be.equal('<script id="tmpl-abc-1" type="text/x-tmpl"><div>abc 1</div>' + EOL + '</script>');
      done();
    });

  });


});
