'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  fixtures = require('../../../fixtures');


describe('css formatter', function () {

  beforeEach(function() {
    ss.client.reset();
    ss.client.load();
  });

  describe('#init', function () {

    it('should return an object describing what file extensions the formatter handles', function() {

      var formatters = ss.api.client.formatters;

      formatters.css.should.be.type('object');
      formatters.css.extensions.should.eql(['css']);
    });


    it('should return an object describing what asset and content types that the formatter handles',function() {

      var formatters = ss.api.client.formatters;

      formatters.css.should.be.type('object');
      formatters.css.assetType.should.equal('css');
      formatters.css.contentType.should.equal('text/css');
    });
  });

  describe('#compile', function () {

    it('should return the CSS file content as is', function() {

      var concrete = ss.api.client.formatters.css;
      var output;
      concrete.call(path.join(fixtures.project,'client/abc/style.css'),{},function(out) {
        output = out;
        out.should.be.equal(fixtures.expected_css);
      },function(err) {
        should(err).be.equal(undefined);
      });
    });
  });


});
