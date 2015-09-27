'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../fixtures/socketstream'),
  Router = require('../../../../lib/http/router').Router,
  options = ss.client.options,
  defineAbcClient = require('../abcClient'),
  fixtures = require('../../../fixtures');

var responseStub = {
  writeHead: function() {},
  end: function(body) {
    this.body = body;
  }
};


describe('development mode asset server', function () {

  var router = new Router();
  fixtures.setProject('project');


  beforeEach(function() {
    ss.client.reset();
  });


  it('should serve system loader module',function() {

    var client = defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/dev')(ss.api, router, options);
    });

    var browserify = fs.readFileSync(path.join(__dirname,'../../../../lib/client/bundler/browserify.client.js'),'utf8');

    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?mod=loader' };
    router.route(req.url,req,responseStub).should.equal(true);
    responseStub.body.should.equal(browserify);
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
      var req = {url: '/assets/abc/'+client.id+'.js?_=/client/abc/index.js' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal('require.define("/client/abc/index", function (require, module, exports, __dirname, __filename){\n// test\n\n});');

      // dev time URL
      req = {url: '/assets/abc/'+client.id+'.js?_=client/abc/index.js' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal('require.define("/client/abc/index", function (require, module, exports, __dirname, __filename){\n// test\n\n});');
    });



    it('should provide a route for serving requests for CSS files', function() {

      var client = defineAbcClient({
        code: './abc/index.a'
      }, function() {
        require('../../../../lib/client/serve/dev')(ss.api, router, options);
      });

      // dev time URL
      var req = {url: '/assets/abc/'+client.id+'.css?_=client/abc/style.css' };
      router.route(req.url,req,responseStub).should.equal(true);
      responseStub.body.should.equal(fixtures.expected_css);
    });


  it('should define modules importedBy correctly with pathPrefix');

  it('should handle strings as served content');

  it('should handle Buffers as served content');

  it('should serve content with correct header');

});
