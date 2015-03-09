'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( '../../../../lib/socketstream'),
    options = ss.client.options;

describe('bundler', function () {

  //TODO set project root function

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  describe('API',function() {

    it('should resolve paths in default dirs',function() {
      var paths = ss.api.bundler.sourcePaths({
        css: 'main.css',
        code: 'main.js',
        tmpl: 'main.html'
      });

      paths.css.should.eql(['./css/main.css']);
      paths.code.should.eql(['./code/main.js']);
      paths.tmpl.should.eql(['./templates/main.html']);
    });
  });
});
