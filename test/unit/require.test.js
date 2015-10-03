'use strict';

var ss = require( '../../fixtures/socketstream'),
	sinon = require('sinon');

describe('ss.require', function() {
	it('should load builtin default bundler', function() {
		var mod = ss.require('default','client/bundler');
		expect(mod).should.be(require('../../../lib/client/bundler/default'));
	});

	it('should load builtin production bundler', function() {
		var mod = ss.require('production','client/bundler');
		expect(mod).should.be(require('../../../lib/client/bundler/production'));
	});

	it('should load builtin jade formatter', function() {
		var mod = ss.require('jade','client/formatters');
		expect(mod).should.be(require('../../../lib/client/formatters/jade'));
	});

	it('should load builtin sass formatter', function() {
		var mod = ss.require('sass','client/formatters');
		expect(mod).should.be(require('../../../lib/client/formatters/sass'));
	});

	it('should call error callback if module not found', function() {
		var spy = sinon.spy();
		var mod = ss.require('not-there','client/formatters',spy);
		expect(mod).should.be(null);
	});
});