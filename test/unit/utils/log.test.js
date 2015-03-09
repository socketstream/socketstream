'use strict';

var path = require('path'),
    ss   = require( '../../../lib/socketstream'),
    log  = require( '../../../lib/utils/log');

describe('lib/utils/log', function() {
    ss.api.publish = {
      all: function() {}
    }

    it('should be a function', function(done) {
        log.should.have.a.type('function');
        done();
    });
    it('should have a function property #debug', function(done) {
        log.should.have.a.property('debug').with.a.type('function');
        done();
    });
    it('should have a function property #info', function(done) {
        log.should.have.a.property('info').with.a.type('function');
        done();
    });
    it('should have a function property #warn', function(done) {
        log.should.have.a.property('warn').with.a.type('function');
        done();
    });
    it('should have a function property #error', function(done) {
        log.should.have.a.property('error').with.a.type('function');
        done();
    });
});
