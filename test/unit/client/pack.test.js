'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  logHook = require('../../helpers/logHook.js'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient'),
  fixtures = require('../../fixtures');

describe('pack-if-needed',function() {
  ss.client.set({liveReload:false});

  afterEach(function(done) {
    ss.api.unload();
    ss.client.forget();
    ss.tasks.forget();
    fixtures.cleanup(done);
  });

  beforeEach(function(done) { fixtures.reset(done); });

  describe('{doing fresh assets}', function() {

    var client;

    afterEach(function(done) {
      ss.client.forget();
      ss.tasks.forget();
      fixtures.cleanup(done);
    });

    beforeEach(function(done) { fixtures.reset(done); });

    beforeEach(function(done) {
      ss.root = ss.api.root = fixtures.project;

      client = defineAbcClient({ tmpl:undefined }, null, false);

      logHook.on();
      ss.client.packAssets();

      ss.start('load-api','pack-if-needed',done);
    });
    beforeEach(function() { logHook.off(); });

    it('should pack ABC assets correctly', function() {

      var html = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.html'),'utf-8');
      var js = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.js'),'utf-8');
      var css = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.css'),'utf-8');

      html.should.equal(fixtures.expected_html_packed);
      js.should.equal(fixtures.expected_js_packed);
      css.should.equal(fixtures.expected_css_packed);
    });
  });

  describe('{with existing default ABC assets}', function() {

    var client, initialID, outs;

    afterEach(function(done) {
      ss.client.forget();
      ss.tasks.forget();
      fixtures.cleanup(done);
    });

    beforeEach(function(done) { fixtures.reset(done); });

    beforeEach(function(done) {

      client = defineAbcClient({ tmpl:undefined }, null, false);
      ss.client.packAssets();

      initialID = client.id;

      logHook.on();

      ss.start(['load-api','pack-if-needed'],done);
    });

    beforeEach(function() {
      outs = logHook.off();
      ss.client.unload();

      client = defineAbcClient({ tmpl:undefined }, null, false);
      ss.client.packAssets();

      // ss.api.orchestrator.start('pack-if-needed',done);
    });

    it('should reuse existing assets if possible', function() {
      client.id.should.equal(initialID);

      var bundler = ss.api.bundler.get(client);
      bundler.useLatestsPackedId();

      var task = ss.api.orchestrator.tasks['pack-if-needed'];
      task.dep.should.eql(['pack-prepare','load-api','abc:pack-unneeded']);
    });

  });

  describe('{ nothing is defined for abc }', function() {

    var client, outs;

    afterEach(function(done) {
      ss.client.forget();
      ss.tasks.forget();
      fixtures.cleanup(done);
    });

    beforeEach(function(done) { fixtures.reset(done); });

    beforeEach(function(done) {

      client = defineAbcClient({ css:undefined, code:undefined, tmpl:undefined }, null, false);

      logHook.on();

      ss.start(['load-api','pack-if-needed'],done);
    });

    beforeEach(function() { outs = logHook.off(); });

    it('should make blank css and minimal js bundles when ', function(done) {

      console.log('-----\n',outs);
      outs[0].should.match(/Pre-packing and minifying the .abc. client.../);
      //outs[1].should.match(/3 previous packaged files deleted/);
      outs[1].should.match(/Minified CSS from 0 KB to 0 KB/);
      outs[2].should.match(new RegExp('Packed 0 files into /client/static/assets/abc/'+client.id+'.css'));
      outs[3].should.match(new RegExp('Packed 4 files into /client/static/assets/abc/'+client.id+'.js'));
      outs[4].should.match(new RegExp('Created and cached HTML file /client/static/assets/abc/'+client.id+'.html'));

      var js = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.js'),'utf-8');
      var css = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.css'),'utf-8');
      var expected_js = fs.readFileSync(path.join(fixtures.project,'client/abc/empty-expected.min.js'),'utf-8');

      js.should.equal(expected_js);
      css.should.equal(fixtures.expected_css_packed);
    });
  });

  describe('{ default abc client with constant }', function() {

    var client, outs;

    afterEach(function(done) {
      ss.client.forget();
      ss.tasks.forget();
      fixtures.cleanup(done);
    });

    beforeEach(function(done) { fixtures.reset(done); });

    beforeEach(function(done) {

      client = defineAbcClient({ tmpl:undefined }, null, false);

      ss.api.client.send('constant','abc','abc');

      logHook.on();

      ss.start(['load-api','pack-if-needed'],done);
    });

    beforeEach(function() { outs = logHook.off(); });

    it('should be available in formatters pack simple css and js', function() {

      outs[0].should.match(/Pre-packing and minifying the .abc. client.../);
      outs[1].should.match(/Minified CSS from 0.016 KB to 0 KB/);
      outs[2].should.match(new RegExp('Packed 1 files into /client/static/assets/abc/'+client.id+'.css'));
      outs[3].should.match(/Minified .\/abc\/index.js from 0.099 KB to 0.049 KB/);
      outs[4].should.match(new RegExp('Packed 5 files into /client/static/assets/abc/'+client.id+'.js'));
      outs[5].should.match(new RegExp('Created and cached HTML file /client/static/assets/abc/'+client.id+'.html'));

      var html = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.html'),'utf-8');
      var js = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.js'),'utf-8');
      var css = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.css'),'utf-8');

      html.should.equal(fixtures.expected_html_packed);
      js.should.equal(fixtures.expected_js_packed);
      css.should.equal(fixtures.expected_css_packed);
    });
  });


  it('should make JS bundle with multiple modules if directory is entry point');

  it('should make JS bundle with start if startInBundle is true');

  it('should make CSS bundle with multiple files if directory is entry point');

  it('should make CSS bundle with multiple files from multiple entry points');

  it('should determine the correct IDs early so order of asset creation doesn\'t matter for pack-if-needed');

  it('should determine the correct IDs early so order of asset creation doesn\'t matter for pack-all');
});
