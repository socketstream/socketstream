'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  logHook = require('../../helpers/logHook.js'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient'),
  fixtures = require('../../fixtures');

describe('pack',function() {

  beforeEach(function(done) {
    fixtures.reset(done);
  });

  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
    ss.client.set({liveReload:false});
  });

  afterEach(function(done) {
    ss.client.forget();
    fixtures.cleanup(done);
  });

  function newEngine(api,config,options) {
    api.should.equal(ss.api);
    options.should.equal(ss.client.options);
    return {
      name: 'New',
      process: function (template, path, id, opts) {
        return '<script id="new-' + id + '" type="text/x-tmpl">' + template + JSON.stringify(opts.constants) + '</script>';
      }
    }
  }

  describe('{with existing assets}', function() {

    var client, initialID;

    beforeEach(function(done) {
      fixtures.reset(done);
    });

    beforeEach(function(done) {

      logHook.on();

      client = defineAbcClient({
        code: undefined,
        css: undefined
      }, function() {

        ss.client.formatters.add('html');
        ss.client.formatters.add('css');
        ss.client.formatters.add('javascript');

        ss.client.packAssets();
      });

      initialID = client.id;

      // mimicks the rest of client load
      ss.client.addTasks();
      ss.client.orchestrator.start('serve',done); // this will be moved to socketstream.js
    });

    beforeEach(function(done) {

      ss.client.unload();
      ss.client.forget();

      client = defineAbcClient({
        code: undefined,
        css: undefined
      }, function() {

        ss.client.formatters.add('html');
        ss.client.formatters.add('css');
        ss.client.formatters.add('javascript');

        options.packedAssets = true;
      });

      // mimicks the rest of client load
      ss.client.addTasks();
      ss.client.orchestrator.start('serve',done);
    });

    beforeEach(function() {
      logHook.off();
    });

    it('should reuse existing assets if possible', function() {
      client.id.should.equal(initialID);

      var bundler = ss.api.bundler.get(client);
      bundler.determineLatestsPackedId();

      var tasks = ss.client.buildTasks();
      tasks.should.have.length(0);
    });

  });

  it('should make blank css and minimal js bundles when nothing is defined', function() {

    var client = defineAbcClient({
      code: undefined,
      css: undefined
    }, function() {

      ss.client.formatters.add('html');
      ss.client.formatters.add('css');
      ss.client.formatters.add('javascript');
    });

    logHook.on();
    ss.api.bundler.pack(client);
    var outs = logHook.off();
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
    css.should.equal('');
  });

  it('should be available in formatters pack simple css and js', function() {

    var client = defineAbcClient({ }, function() {

        ss.api.client.send('constant','abc','abc');

        ss.client.formatters.add('html');
        ss.client.formatters.add('css');
        ss.client.formatters.add('javascript');
      });

    logHook.on();
    ss.api.bundler.pack(client);
    var outs = logHook.off();
    outs[0].should.match(/Pre-packing and minifying the .abc. client.../);
    outs[1].should.match(/Minified CSS from 0.016 KB to 0 KB/);
    outs[2].should.match(new RegExp('Packed 1 files into /client/static/assets/abc/'+client.id+'.css'));
    outs[3].should.match(/Minified .\/abc\/index.js from 0.099 KB to 0.049 KB/);
    outs[4].should.match(new RegExp('Packed 5 files into /client/static/assets/abc/'+client.id+'.js'));
    outs[5].should.match(new RegExp('Created and cached HTML file /client/static/assets/abc/'+client.id+'.html'));

    var html = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.html'),'utf-8');
    var js = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.js'),'utf-8');
    var css = fs.readFileSync(path.join(fixtures.project,'client/static/assets/abc/' + client.id + '.css'),'utf-8');
    var expected_html = fs.readFileSync(path.join(fixtures.project,'client/abc/expected-with-abc-constants.html'),'utf-8');
    var expected_js = fs.readFileSync(path.join(fixtures.project,'client/abc/expected.min.js'),'utf-8');

    html.should.equal(expected_html);
    js.should.equal(expected_js);
    css.should.equal('');
  });

  it('should make JS bundle with multiple modules if directory is entry point');

  it('should make JS bundle with start if startInBundle is true');

  it('should make CSS bundle with multiple files if directory is entry point');

  it('should make CSS bundle with multiple files from multiple entry points');
});

