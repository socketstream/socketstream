'use strict';

var ss = require( '../../../lib/socketstream'),
    //options = ss.client.options,
    //defineAbcClient = require('./abcClient'),
    fixtures = require('../../fixtures');


describe('start tasks plan', function () {
  var should = require('should');

  ss.root = ss.api.root = fixtures.project;

  beforeEach(function () {
  });

  function start() {
    return ss.tasks.plan(arguments);
  }

  it('should plan with standard start call', function() {
    var server = require('http').createServer();

    // ss.start(server)
    var plan = start(server);

    plan.httpServer.should.equal(server);
    plan.targets.should.eql(['default']);
  });

  it('should plan with start() call', function() {
    // ss.start()
    var plan = start();

    should(plan.httpServer).be.equal(null);
    plan.targets.should.eql(['default']);
  });

  it('should plan with start("pack-all") call', function() {

    // ss.start("pack-all")
    var plan = start('pack-all');

    should(plan.httpServer).be.equal(null);
    plan.targets.should.eql(['pack-all']);
  });

  it('should plan with start(server,"pack-all") call', function() {
    var server = require('http').createServer();

    // ss.start(server, "pack-all")
    var plan = start(server, 'pack-all');

    should(plan.httpServer).be.equal(server);
    plan.targets.should.eql(['pack-all']);
  });

  it('should plan with start("pack-all","more-stuff") call', function() {
    // ss.start("pack-all","more-stuff")
    var plan = start('pack-all','more-stuff');

    should(plan.httpServer).be.equal(null);
    plan.targets.should.eql(['pack-all','more-stuff']);
  });

  it('should plan with start(server, "pack-all","more-stuff") call', function() {
    var server = require('http').createServer();

    // ss.start("pack-all","more-stuff")
    var plan = start(server, 'pack-all','more-stuff');

    should(plan.httpServer).be.equal(server);
    plan.targets.should.eql(['pack-all','more-stuff']);
  });

  it('should plan with start("pack-all",function) call', function() {
    var plan = start('pack-all', function() {});

    should(typeof plan.callback).be.equal('function');
    plan.targets.should.eql(['pack-all']);
  })
});
