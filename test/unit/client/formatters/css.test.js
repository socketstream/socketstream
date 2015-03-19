'use strict';

var path    = require('path'),
  should  = require('should'),
  ss      = require( '../../../../lib/socketstream'),
  options = ss.client.options;


describe('css formatter', function () {

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

      ss.api.bundler.load();
      var formatters = ss.api.client.formatters = ss.client.formatters.load();

      formatters.css.should.be.type('object');
      formatters.css.extensions.should.eql(['css']);
    });


    it('should return an object describing what asset and content types that the formatter handles',function() {

      ss.api.bundler.load();
      var formatters = ss.api.client.formatters = ss.client.formatters.load();

      formatters.css.should.be.type('object');
      formatters.css.assetType.should.equal('css');
      formatters.css.contentType.should.equal('text/css');
    });
  });

  describe('#compile', function () {

    it('should return the CSS file content as is', function() {

      ss.api.bundler.load();
      ss.api.client.formatters = ss.client.formatters.load();

      var concrete = ss.api.client.formatters.css;
      var output;
      concrete.call(path.join(__dirname,'../../..','fixtures/project/client/abc/style.css'),{},function(out) {
        output = out;
        out.should.be.equal('/* style.css */\n');
      },function(err) {
        should(err).be.equal(undefined);
      });
    });
  });


});
