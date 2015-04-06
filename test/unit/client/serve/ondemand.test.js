'use strict';

var path    = require('path'),
  should  = require('should'),
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


describe('production mode asset server', function () {

  var router = new Router();


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
    ss.client.formatters.add('javascript');
  });

  afterEach(function() {
    ss.client.forget();
  });


  /*TODO
  it('should provide a route for serving javascript code', function(){
    code: './abc/index.a'
  }, function() {
    require('../../../../lib/client/serve/ondemand')(ss.api, router, options);
  });

  // dev time URL
  var req = {url: '/assets/abc/'+client.id+'.js?mod=loader' };
  router.route(req.url,req,responseStub).should.equal(true);
   responseStub.body.should.equal('// calc pi\n');
  });
*/


    it('should provide a route for serving web worker requests', function() {
      var client = defineAbcClient({
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
