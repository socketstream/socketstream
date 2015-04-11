'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient');

describe('pack',function() {


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
  });

  afterEach(function() {
    ss.client.forget();
  });

  var newEngine = function newEngine(api,config,options) {
    api.should.equal(ss.api);
    options.should.equal(ss.client.options);
    return {
      name: 'New',
      process: function (template, path, id, opts) {
        return '<script id="new-' + id + '" type="text/x-tmpl">' + template + JSON.stringify(opts.constants) + '</script>';
      }
    }
  };

  it('should make blank css and minimal js bundles when nothing is defined', function() {

    var client = defineAbcClient({
      code: undefined,
      css: undefined
    }, function() {

      ss.client.formatters.add('html');
      ss.client.formatters.add('css');
      ss.client.formatters.add('javascript');
    });

    ss.api.bundler.pack(client);

    var js = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/static/assets/abc/' + client.id + '.js'),'utf-8');
    var css = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/static/assets/abc/' + client.id + '.css'),'utf-8');
    var expected_js = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/abc/empty-expected.min.js'),'utf-8');

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

    ss.api.bundler.pack(client);

    var html = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/static/assets/abc/' + client.id + '.html'),'utf-8');
    var js = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/static/assets/abc/' + client.id + '.js'),'utf-8');
    var css = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/static/assets/abc/' + client.id + '.css'),'utf-8');
    var expected_html = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/abc/expected-with-abc-constants.html'),'utf-8');
    var expected_js = fs.readFileSync(path.join(__dirname,'../../fixtures/project/client/abc/expected.min.js'),'utf-8');

    html.should.equal(expected_html);
    js.should.equal(expected_js);
    css.should.equal('');
  });

  it('should make JS bundle with multiple modules if directory is entry point');

  it('should make JS bundle with start if startInBundle is true');

  it('should make CSS bundle with multiple files if directory is entry point');

  it('should make CSS bundle with multiple files from multiple entry points');
});

