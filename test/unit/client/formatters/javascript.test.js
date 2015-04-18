'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream');


describe('js formatter', function () {

  beforeEach(function() {

    // back to initial client state
    ss.client.assets.unload();
    ss.client.assets.load();
  });

  afterEach(function() {
    ss.client.forget();
  });


  describe('#init', function () {

    it('should return an object describing what file extensions the formatter handles', function() {

      ss.client.formatters.add('javascript');

      ss.api.bundler.load();
      var formatters = ss.api.client.formatters = ss.client.formatters.load();

      formatters.js.should.be.type('object');
      formatters.js.extensions.should.eql(['js']);
    });

    it('should return an object describing what asset and content types that the formatter handles',function() {

      ss.client.formatters.add('javascript');

      ss.api.bundler.load();
      var formatters = ss.api.client.formatters = ss.client.formatters.load();

      formatters.js.should.be.type('object');
      formatters.js.assetType.should.equal('js');
      formatters.js.contentType.should.equal('text/javascript; charset=utf-8');
    });

  });

  describe('#compile', function () {

    it('should return the JS file content as is', function() {

      ss.client.formatters.add('javascript');

      ss.api.bundler.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var concrete = ss.api.client.formatters.js;
      var output;
      concrete.call(path.join(__dirname,'../../..','fixtures/project/client/abc/index.js'),{},function(out) {
        output = out;
        out.should.be.equal('// test\n');
      },function(err) {
        should(err).be.equal(undefined);
      });
    });

    it('should return the MAP file content as is for processing',function() {

      ss.client.formatters.add('map');

      ss.api.bundler.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var concrete = ss.api.client.formatters.map;
      var output;
      concrete.call(path.join(__dirname, '../../..', 'fixtures/project/client/abc/index.js'), {}, function (out) {
        output = out;
        out.should.be.equal('// test\n');
      }, function (err) {
        should(err).be.equal(undefined);
      });
    });
  });

});
