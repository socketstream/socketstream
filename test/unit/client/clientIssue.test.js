'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  options = ss.client.options,
  fixtures = require('../../fixtures');


describe('client asset manager index', function () {

  ss.root = ss.api.root = fixtures.project;

  it('should show exception in browser when serveDebugInfo is set');

  it('should render errors in template engine calls depending on serveDebugInfo in client options');
});
