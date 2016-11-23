'use strict';

var ss = require( '../fixtures/socketstream');


describe('ss.require', function() {
	it('should load builtin', function() {
		var mod = ss.require('default','client/bundler');
		expect(mod).should.be(require('../../../lib/client/bundler/default'));
	});
});
