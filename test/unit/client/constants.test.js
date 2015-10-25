'use strict';

var ss      = require( '../../../lib/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('./abcClient');

var view = require('../../../lib/client/view');

var responseStub = {
    writeHead: function() {},
    end: function() {}
};

describe('constants',function() {

  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
    ss.client.set({liveReload:false});
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

  it('should be available in template engine formatters', function(done) {

    var compileOptions = null;

    defineAbcClient({ constants:{def:'def'} },function() {

      var formatter = {
        init: function () {

          return {
            name: 't1',
            extensions: ['html'],
            assetType: 'html',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              compileOptions = options;
              cb('t1='+options.constants.abc);
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
      //ss.client.formatters.add('html');
      ss.client.templateEngine.use(newEngine,'.');
    });

    ss.api.client.send('constant','abc','abc');

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script id="new-1" type="text/x-tmpl">t1=abc{"abc":"abc","def":"def"}</script>');
      done();
    });
  });

  it('should be available in formatters', function() {

    var compileOptions = null,
        client = defineAbcClient({ code: './abc/index.a' }, function() {

      ss.api.client.send('constant','abc','abc');

      var formatter = {
        init: function () {

          return {
            name: 'f1',
            extensions: ['a', 'b'],
            assetType: 'js',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              compileOptions = options;
              cb('//');
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
    });


    // dev time URL
    // var req = {url: '/assets/abc/'+client.id+'.js?_=./client/abc/index.a' };
    // router.route(req.url,req,responseStub).should.equal(true);
    // compileOptions.constants.should.be.type('object');
    // compileOptions.constants.abc.should.equal('abc');

    //TODO packAssetSet
    var bundler = ss.api.bundler.get(client);
    //ss.api.bundler.packAssetSet('js', client, bundler.toMinifiedJS, fn(){});
  });

  it('should be loaded in the browser as globals', function(done) {

    var client = defineAbcClient({ constants:{'def':'def'} }, function() {

        ss.api.client.send('constant','abc','abc');

        ss.client.formatters.add('html');
      });

    var expectedHtml = '<html>\n'+
      '<head><title>ABC</title></head>\n'+
      '<body><p>ABC</p>'+
      '<script>var abc="abc";\nvar def="def";\nrequire("/client/abc/index");</script>'+
      '</body>\n'+
      '</html>\n';

    view(ss.api, client, options, function(output) {
      output.should.equal(expectedHtml);
      done();
    });
  });
});

describe('locals', function() {

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
        return '<script id="new-' + id + '" type="text/x-tmpl">' + template + JSON.stringify(opts.locals) + '</script>';
      }
    };
  };

  it('should be available in template engine formatters', function(done) {

    var compileOptions = null;

    defineAbcClient({ locals:{def:'def'} },function() {

      var formatter = {
        init: function () {

          return {
            name: 't1',
            extensions: ['html'],
            assetType: 'html',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              compileOptions = options;
              cb('t1='+options.locals.abc);
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
      //ss.client.formatters.add('html');
      ss.client.templateEngine.use(newEngine,'.');
    });

    ss.api.client.send('local','abc','abc');

    var bundler = ss.api.bundler.get('abc');

    var files = [ bundler.entryFor('tmpl','client/templates/1.html') ];

    ss.client.templateEngine.generate(bundler, files, function (tag) {
      tag.should.be.equal('<script id="new-1" type="text/x-tmpl">t1=abc{"abc":"abc","def":"def"}</script>');
      done();
    });
  });

  it('should be available in formatters', function() {

    var compileOptions = null,
        client = defineAbcClient({ code: './abc/index.a' }, function() {

      ss.api.client.send('local','abc','abc');

      var formatter = {
        init: function () {

          return {
            name: 'f1',
            extensions: ['a', 'b'],
            assetType: 'js',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              compileOptions = options;
              cb('//');
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
      //ss.client.templateEngine.use('angular');
    });

    // dev time URL
    // var req = {url: '/assets/abc/'+client.id+'.js?_=./client/abc/index.a' };
    // router.route(req.url,req,responseStub).should.equal(true);
    // compileOptions.locals.should.be.type('object');
    // compileOptions.locals.abc.should.equal('abc');

    //TODO packAssetSet
    var bundler = ss.api.bundler.get(client);
    //ss.api.bundler.packAssetSet('js', client, bundler.toMinifiedJS, fn(){});
  });

});
