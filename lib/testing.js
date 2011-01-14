# TODO: Huge changes to testing to come

require('./globals');

// Import testing framework
global.vows = require('vows');
global.assert = require('assert');
global.should = require('should');

// Select TEST DB
R.select(9);
