'use strict';

var path    = require('path'),
  ss      = require( '../../../../lib/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('../abcClient');

describe('custom bundler', function () {

  describe('system modules', function() {

    beforeEach(function() {

      // back to initial client state
      ss.client.assets.unload();
      ss.client.assets.load();
    });

    afterEach(function() {
      ss.client.forget();
    });


    it('should be rendered correctly as htmlTags', function() {

      function customBundler(ss, client, options) {
        return ss.bundler.create({
          define: define,
          entries:entries
        });

        function define(paths) {

          client.paths = ss.bundler.sourcePaths(paths);
          client.constants = paths.constants || paths.consts;
          client.locals = paths.locals;
          client.entryInitPath = ss.bundler.findEntryPoint(client);

          return ss.bundler.destsFor(client);
        }

        function entries() {
          return [ss.bundler.browserifyLoader(), ss.bundler.systemLibs(), ss.bundler.systemModule('socketstream')];
        }
      }

      var client = defineAbcClient({
        custom: customBundler
      },function() {
      });

      var bundler = ss.api.bundler.get(client);
      var tags = bundler.htmlTags('js',false);

      tags[0].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=loader" type="text/javascript"></script>');
      tags[1].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=libs" type="text/javascript"></script>');
      tags[2].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=socketstream" type="text/javascript"></script>');
    });
  });

  describe('start code',function() {

    it('should be rendered correctly as htmlTags');

  });

});
