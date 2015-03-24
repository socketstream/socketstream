'use strict';

var path    = require('path'),
  should  = require('should'),
  ss      = require( '../../../lib/socketstream'),
  Router = require('../../../lib/http/router').Router,
  options = ss.client.options,
  defineAbcClient = require('./abcClient');

var responseStub = {
    writeHead: function(status,headers) {},
    end: function(body) {}
  };

describe('constants',function() {

  var router = new Router();


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
  });

  afterEach(function() {
    ss.client.forget();
  });

  it('should be available in formatters', function() {

    var client = defineAbcClient({ code: './abc/index.a' }, function() {

      require('../../../lib/client/serve/dev')(ss.api, router, options);

      ss.api.client.send('constant','abc','abc');

      var formatter = {
        init: function (root, config) {

          return {
            name: 'f1',
            extensions: ['a', 'b'],
            assetType: 'js',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              options.constants.should.be.type('object');
              options.constants.abc.should.equal('abc');
              cb('//');
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
      //ss.client.templateEngine.use('angular');
    });


    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?_=./abc/index.a' };
    router.route(req.url,req,responseStub).should.equal(true);
    //TODO assert formatter.compile is called

    //TODO packAssetSet
    var bundler = ss.api.bundler.get(client);
    //ss.api.bundler.packAssetSet('js', client, bundler.toMinifiedJS);
  });

  it('should be loaded in the browser as globals', function() {

  });
});

describe('locals', function() {

  var router = new Router();


  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
  });

  afterEach(function() {
    ss.client.forget();
  });

  it('should be available in formatters', function() {

    var client = defineAbcClient({ code: './abc/index.a' }, function() {

      require('../../../lib/client/serve/dev')(ss.api, router, options);

      ss.api.client.send('local','abc','abc');

      var formatter = {
        init: function (root, config) {

          return {
            name: 'f1',
            extensions: ['a', 'b'],
            assetType: 'js',
            contentType: 'text/javascript; charset=utf-8',
            compile: function (pathEntry, options, cb) {
              options.locals.should.be.type('object');
              options.locals.abc.should.equal('abc');
              cb('//');
            }
          };
        }
      };

      ss.client.formatters.add(formatter,{});
      //ss.client.templateEngine.use('angular');
    });

    // dev time URL
    var req = {url: '/assets/abc/'+client.id+'.js?_=./abc/index.a' };
    router.route(req.url,req,responseStub).should.equal(true);
    //TODO assert formatter.compile is called

    //TODO packAssetSet
    var bundler = ss.api.bundler.get(client);
    //ss.api.bundler.packAssetSet('js', client, bundler.toMinifiedJS);
  });

});
