'use strict';

var path    = require('path'),
    ss      = require( '../../../../lib/socketstream'),
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


describe('production mode asset server', function () {

  var router = new Router();
  ss.root = ss.api.root = fixtures.project;


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
    ss.client.formatters.add('javascript');
    //console.log(ss.api.client.root,'is client root');
    //console.log(ss.api.root, ss.client.options.dirs.client);
  });

  afterEach(function() {
    ss.client.forget();
    ss.tasks.forget();
  });


  it('should provide a route for serving javascript code', function(){
    defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/ondemand')(ss.api, router, options);
    });

    // dev time URL
    var req = {url: '/_serve/code?extras/e1.js' };
    router.route(req.url,req,responseStub).should.equal(true);
    responseStub.body.should.equal('var e1 = 1;\n');
  });

  it('should provide a bundle of javascript code for a directory entry');

  it('should provide a route for serving web worker requests', function() {
    defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/ondemand')(ss.api, router, options);
    });

    // dev time URL
    var req = {url: '/_serve/worker?/pi.js' };
    router.route(req.url,req,responseStub).should.equal(true);
    responseStub.body.should.equal('// calc pi\n');
  });



    it('should serve requests from a cache, rather than reading a file');



    it('should populate the cache for a request, if that request hasn\'t been processed before');



    it('should compress the file, if specified in the packAssets options');



    it('should raise an error if the file is referenced, but missing');


  it('should define modules importedBy correctly with pathPrefix');


});
