'use strict';

var ss = require( '../../fixtures/socketstream'),
    fixtures = require( '../../fixtures');

xdescribe('test-socketstream', function() {
  beforeEach(function(done) {
    ss.root = ss.api.root = fixtures.project;
    ss.client.reset();
    //ss.api.rpc = undefined;
    ss.api.load();
    ss.start('test-socketstream',done);
  });

  describe('sendMessage', function() {

    it('should publish messages received', function(done) {
      var text = 'Hello World!';
      ss.api.rpc('demo.sendMessage', text, function(res) {
        expect(res).to.equal([true]);
        //TODO published expectations
        // expect(..).to.equal({ status:'success', content:text});
      })
    });
  });
});
