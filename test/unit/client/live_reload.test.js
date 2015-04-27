'use strict';

var path    = require('path'),
  fs      = require('fs'),
  ss      = require( '../../../lib/socketstream'),
  chokidar = require('chokidar'),
  logHook = require('../../helpers/logHook.js'),
  options = ss.client.options;


describe('client asset manager index', function () {

  var sinon = require('sinon'),
      should = require('should'),
      chokidarSpy;

  ss.root = ss.api.root = path.join(__dirname, '../../fixtures/project');

  beforeEach(function () {
    chokidarSpy = sinon.spy(chokidar,'watch');
  });

  afterEach(function () {
    chokidar.watch.restore();
    ss.client.unload();
    ss.client.forget();
  });

  it('should start live reload when in development', function() {
    ss.client.options.packedAssets = false;

    logHook.on();
    ss.client.load();

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
  });

  it('should not start live reload when liveReload option is set to false', function() {
    ss.client.options.packedAssets = false;
    ss.client.options.liveReload = false;

    logHook.on();
    ss.client.load();

    should(chokidarSpy.called).equal(false);
    var logs = logHook.off();
    logs.should.have.length(0);
  });

  it('should monitor directories according to option liveReload', function() {
    ss.client.options.packedAssets = false;
    ss.client.options.liveReload = ['code','css'];

    logHook.on();
    ss.client.load();

    should(chokidarSpy.calledWithMatch([
      path.join(ss.api.root,'client','code'),
      path.join(ss.api.root,'client','css')],{
      ignored: /(\/\.|~$)/
    })).equal(true);
    var logs = logHook.off();
    logs.should.have.length(0);
  });

  it('should monitor custom directories according to option liveReload');

  it('should pass delayTime and guardTime to chokidar');

  it('should not pollute client options with options.onChange')
});
