'use strict';

var ss = require('../fixtures/socketstream'),
	path = require('path'),
	fixtures = require('../fixtures'),
	chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	sinonChai = require('sinon-chai');
	chai.use(sinonChai);

describe('ss.require', function() {

	ss.root = ss.api.root = fixtures.project;

	it('should load builtin default bundler', function() {
		var mod = ss.api.require('default','client/bundler');
		expect(mod).to.equal(require('../../lib/client/bundler/default'));
	});

	it('should load builtin production bundler', function() {
		var mod = ss.api.require('production','client/bundler');
		expect(mod).to.equal(require('../../lib/client/bundler/production'));
	});

	it('should load builtin jade formatter', function() {
		var mod = ss.api.require('jade','client/formatters');
		expect(mod).to.equal(require('../../lib/client/formatters/jade'));
	});

	it('should load builtin sass formatter', function() {
		var mod = ss.api.require('sass','client/formatters');
		expect(mod).to.equal(require('../../lib/client/formatters/sass'));
	});

	it('should call error callback if module not found', function() {
		var spy = sinon.spy();
		var mod = ss.api.require('not-there','client/formatters',spy);
		expect(mod).to.equal(undefined);
		expect(spy).to.have.been.calledWith();
	});

	it('should load package from project', function() {
		var mod = ss.api.require('object-assign');
		expect(mod).to.be.a('function');
	});

	it('should identify path of package from project', function() {
		var p = ss.api.require.resolve('object-assign');
		expect(p).to.equal(path.join(__dirname, '../fixtures','project/node_modules/object-assign/index.js'));
	});
});

describe('ss.require.forEach', function() {
	it('should identify modules matching given patterns');
});
