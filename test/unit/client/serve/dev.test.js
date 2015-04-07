'use strict';

var path    = require('path'),
  should  = require('should'),
  fs      = require('fs'),
  path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  Router = require('../../../../lib/http/router').Router,
  options = ss.client.options,
  defineAbcClient = require('../abcClient');

var responseStub = {
  writeHead: function(status,headers) {},
  end: function(body) {
    this.body = body;
  }
};


describe('development mode asset server', function () {

  var router = new Router();
  ss.root = ss.api.root = path.join(__dirname, '../../../../fixtures/project');


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
    ss.client.formatters.add('javascript');
    ss.client.formatters.add('css');
  });

  afterEach(function() {
    ss.client.forget();
  });

  it('should serve system loader module',function() {

    var client = defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/dev')(ss.api, router, options);
      ss.client.assets.send('lib','browserify.js','// loader');
    });

    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?mod=loader' };
    router.route(req.url,req,responseStub).should.equal(true);
    responseStub.body.should.equal('// loader');
  });

  it('should provide a route for serving system libraries and modules', function() {
    var client = defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/dev')(ss.api, router, options);
    });

    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?mod=eventemitter2' };
    router.route(req.url,req,responseStub).should.equal(true);
    var ee = fs.readFileSync(path.join(__dirname,'../../../../lib/client/system/modules/eventemitter2.js'));
    responseStub.body.should.equal('require.define("eventemitter2", function (require, module, exports, __dirname, __filename){\n'+
      ee+ '\n});');
  });



    it('should provide a route for serving an application\'s client code',function() {

      var client = defineAbcClient({
        code: './abc/index.a'
      }, function() {
        require('../../../../lib/client/serve/dev')(ss.api, router, options);
      });

      // dev time URL
      var req = {url: '/assets/abc/'+client.id+'.js?_=/abc/index.js' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal('require.define("/abc/index", function (require, module, exports, __dirname, __filename){\n// test\n\n});');

      // dev time URL
      req = {url: '/assets/abc/'+client.id+'.js?_=abc/index.js' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal('require.define("/abc/index", function (require, module, exports, __dirname, __filename){\n// test\n\n});');
    });



    it('should provide a route for serving requests for CSS files', function() {

      var client = defineAbcClient({
        code: './abc/index.a'
      }, function() {
        require('../../../../lib/client/serve/dev')(ss.api, router, options);
      });

      // dev time URL
      var req = {url: '/assets/abc/'+client.id+'.css?_=abc/style.css' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal('/* style.css */\n');
    });


  it('should define modules importedBy correctly with pathPrefix');

});
