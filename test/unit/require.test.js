'use strict';

var ss = require( '../fixtures/socketstream');
var should = require('should');


describe('ss.require', function() {
	it('should load builtin', function() {
		var mod = ss.api.require('default','client/bundler');
		should(mod).equal(require('../../lib/client/bundler/default'));
	});
});
