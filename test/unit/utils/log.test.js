'use strict';

var path = require('path'),
    ac   = require('../../helpers/assertionCounter'),
    log  = require(path.join(process.env.PWD, 'lib/utils/log'));

describe('lib/utils/log', function() {
    beforeEach(ac.reset);

    it('should be a function', function(done) {
        ac.expect(1);
        log.should.have.a.type('function').andCheck();
        ac.check(done);
    });
    it('should have a function property #debug', function(done) {
        ac.expect(1);
        log.should.have.a.property('debug').with.a.type('function').andCheck();
        ac.check(done);
    });
    it('should have a function property #info', function(done) {
        ac.expect(1);
        log.should.have.a.property('info').with.a.type('function').andCheck();
        ac.check(done);
    });
    it('should have a function property #warn', function(done) {
        ac.expect(1);
        log.should.have.a.property('warn').with.a.type('function').andCheck();
        ac.check(done);
    });
    it('should have a function property #error', function(done) {
        ac.expect(1);
        log.should.have.a.property('error').with.a.type('function').andCheck();
        ac.check(done);
    });
});
