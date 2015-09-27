'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  fixtures = require('../../../fixtures');


describe('html formatter', function () {

  beforeEach(function() {
    ss.client.reset();
    ss.client.load();
  });

  describe('#init', function () {

    it('should return an object describing what file extensions the formatter handles', function() {

      var formatters = ss.api.client.formatters;

      formatters.html.should.be.type('object');
      formatters.html.extensions.should.eql(['html']);
    });


    it('should return an object describing what asset and content types that the formatter handles',function() {

      var formatters = ss.api.client.formatters;

      formatters.html.should.be.type('object');
      formatters.html.assetType.should.equal('html');
      formatters.html.contentType.should.equal('text/html');
    });


    describe('#compile', function () {

      it('should return the HTML file content as is', function() {

        var concrete = ss.api.client.formatters.html;
        var output;
        concrete.call(path.join(fixtures.project,'client/abc/ss.html'),{},function(out) {
          output = out;
          out.should.be.equal('<html>\n<head><title>ABC</title><SocketStream/></head>\n<body><p>ABC</p></body>\n</html>\n');
        },function(err) {
          should(err).be.equal(undefined);
        });
      });

      describe('if header options are passed', function () {

        it('should replace any <SocketStream> tags in the html with the value in the header options');

      });

    });

  });


});
