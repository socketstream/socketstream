'use strict';

var fixtures = require( '../../fixtures'),
    ss = fixtures.socketstreamProject(),
    chai = require('chai'),
    expect = chai.expect;

//ss.start('test-socketstream');

xdescribe('test-socketstream', function() {
  beforeEach(function(done) {
    ss.start('test-socketstream',done);
  });

  describe('sendMessage', function() {

    it('should publish messages received', function(done) {
      var text = 'Hello World!';
      ss.api.rpc('demo.sendMessage', text, function(res) {
        expect(res).to.eql([true]);
        //TODO published expectations
        // expect(..).to.equal({ status:'success', content:text});
        done();
      })
    });
  });
});
