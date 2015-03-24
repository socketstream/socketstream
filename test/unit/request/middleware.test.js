'use strict';

var path    = require('path'),
  should  = require('should'),
  ss      = require( '../../../lib/socketstream'),
  options = ss.client.options;

describe('request middleware', function() {

  it('should be available on socketstream', function() {

    ss.responders.should.be.type('object');
  });

  it('should load internal API with responders');
});
