'use strict';

var path    = require('path'),
  should  = require('should'),
  ss      = require( '../../../../lib/socketstream'),
  Router = require('../../../../lib/http/router').Router,
  options = ss.client.options,
  defineAbcClient = require('../abcClient');

var responseStub = {
  writeHead: function(status,headers) {},
  end: function(body) {}
};


describe('development mode asset server', function () {

  var router = new Router();


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
  });

  afterEach(function() {
    ss.client.forget();
  });

  it('should serve system loader module',function() {

    var client = defineAbcClient({
      code: './abc/index.a'
    }, function() {
      require('../../../../lib/client/serve/dev')(ss.api, router, options);
    });

    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?mod=loader' };
    router.route(req.url,req,responseStub).should.equal(true);
    //TODO check that it's the right content
  });

  it('should provide a route for serving system libraries and modules');



    it('should provide a route for serving an application\'s client code');



    it('should provide a route for serving requests for CSS files');


  it('should define modules importedBy correctly with pathPrefix');

});
