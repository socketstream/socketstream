'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  chokidar = require('chokidar'),
  logHook = require('../../helpers/logHook.js'),
  //options = ss.client.options,
  fixtures = require('../../fixtures');


describe('client asset manager index', function () {

  var sinon = require('sinon'),
      should = require('should'),
      chokidarSpy;

  ss.root = ss.api.root = fixtures.project;

  beforeEach(function () {
    chokidarSpy = sinon.spy(chokidar,'watch');
    logHook.on();
    ss.client.load();
  });

  afterEach(function () {
    chokidar.watch.restore();
    ss.client.unload();
    ss.client.forget();
    ss.tasks.unload();
    ss.tasks.forget();
  });

  it('should start live reload when in development', function() {
    ss.client.options.packedAssets = false;
    ss.tasks.load();
    ss.api.orchestrator.tasks.default.dep.should.containDeep(['live-reload']);
  });

  it('should call chokidar for live-reload', function(done) {

    ss.client.options.packedAssets = false;
    ss.tasks.load();

    ss.tasks.start('live-reload', function() {
      should(chokidarSpy.calledWithMatch([
        path.join(ss.api.root,'client','code'),
        path.join(ss.api.root,'client','css'),
        path.join(ss.api.root,'client','static'),
        path.join(ss.api.root,'client','templates'),
        path.join(ss.api.root,'client','views')],{
        ignored: /(\/\.|~$)/
      })).equal(true);
      var logs = logHook.off();
      logs.should.have.length(0);
      done();
    });
  });

  it('should not start live reload when liveReload option is set to false', function() {
    ss.client.options.packedAssets = false;
    ss.client.options.liveReload = false;
    ss.tasks.load();

    ss.api.orchestrator.tasks.default.dep.should.not.containDeep(['live-reload']);
    var logs = logHook.off();
    logs.should.have.length(0);
  });

  it('should monitor directories according to option liveReload', function() {
    ss.client.options.packedAssets = false;
    ss.client.options.liveReload = ['code','css'];
    ss.tasks.load();

    ss.tasks.start('live-reload', function() {
      should(chokidarSpy.calledWithMatch([
        path.join(ss.api.root,'client','code'),
        path.join(ss.api.root,'client','css')],{
        ignored: /(\/\.|~$)/
      })).equal(true);
      var logs = logHook.off();
      logs.should.have.length(0);
    });
  });

  it('should monitor custom directories according to option liveReload');

  it('should pass delayTime and guardTime to chokidar');

  it('should not pollute client options with options.onChange')
});
