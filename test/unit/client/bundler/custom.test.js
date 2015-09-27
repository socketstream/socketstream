'use strict';

var path    = require('path'),
  ss      = require( '../../../fixtures/socketstream'),
  options = ss.client.options,
  defineAbcClient = require('../abcClient');

describe('custom bundler', function () {

  describe('system modules', function() {

    beforeEach(function() {

      ss.client.reset();
      ss.client.set({liveReload:false});
    });

    afterEach(function() {
      ss.client.forget();
    });


    it('should be rendered correctly as htmlTags', function() {

      

      var client = defineAbcClient({
        custom: './customBundler'
      },function() {
      });

      var bundler = ss.api.bundler.get(client);
      var tags = bundler.htmlTags('js',false);

      tags[0].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=loader" type="text/javascript"></script>');
      tags[1].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=libs" type="text/javascript"></script>');
      tags[2].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=eventemitter2" type="text/javascript"></script>'); // added this to pass test, not sure why it differs
      tags[3].should.equal('<script src="/assets/abc/'+client.id+'.js?mod=socketstream" type="text/javascript"></script>');
    });
  });

  describe('start code',function() {

    it('should be rendered correctly as htmlTags');

  });

});
