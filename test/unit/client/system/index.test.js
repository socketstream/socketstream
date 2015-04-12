'use strict';

var path    = require('path'),
    ss      = require( path.join('../../../..', 'lib/socketstream')),
    options = ss.client.options;

describe('client system library', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

  var should = require('should');

    describe('#send', function () {
        beforeEach(function() {

            options.defaultEntryInit = origDefaultEntryInit;

            ss.client.assets.unload();
            ss.client.assets.load();
        });

        it('should extend libs',function() {

            ss.client.assets.send('lib','extra.js','var extra = 0;');
            var jsAfter = ss.api.bundler.systemLibs();
            jsAfter.should.be.type('object');
            jsAfter.content.should.have.length(14);
        });

        it('should replace libs',function() {

            var jsBefore, jsAfter;

            jsBefore = ss.api.bundler.systemLibs();
            jsBefore.should.be.type('object');
            jsBefore.type.should.be.equal('loader');
            ss.client.assets.send('lib','browserify.js','');
            jsAfter = ss.api.bundler.systemLibs();
            jsAfter.content.should.have.length(0);
        });

        it('should have init code for client', function() {

            var expected = 'require("./entry2");',//ss.client.options.defaultEntryInit,
                client = {
                    entryInitPath: './entry2'
                };

            var start = ss.api.bundler.startCode(client);
            start.should.be.type('object');
            start[start.length-1].type.should.be.equal('start');
            start[start.length-1].content.should.be.equal(expected);
        });

        it('should allow startCode for all clients to be configured', function(){
            var expected = 'require("./startCode");',
                client = {};

            options.defaultEntryInit = 'require("./startCode");';

            var start = ss.api.bundler.startCode(client);
            start.should.be.type('object');
            start[start.length-1].type.should.be.equal('start');
            start[start.length-1].content.should.be.equal(expected);
        });

        //TODO options.entryModuleName
        //TODO options.defaultEntryInit

      it('should add start code to bootstrap',function() {
        var client = {};
        var startLength = ss.api.bundler.startCode(client).length;

        ss.client.assets.send('code','init','//x sysinit');
        var start = ss.api.bundler.startCode(client);
        start[0].content.should.equal('//x sysinit\nrequire("/entry");');
      });

      it('should return undefined for unknown system module', function() {

        var mod = ss.api.bundler.systemModule('unknown-thing');
        should(mod).equal(undefined);
      });

      it('should allow a module to be defined',function() {
        ss.client.assets.send('mod','sysmod','//sysmod');
        var mod = ss.api.bundler.systemModule('sysmod');
        mod.name.should.equal('sysmod');
        mod.includeType.should.equal('system');
        mod.content.should.equal('require.define("sysmod", function (require, module, exports, __dirname, __filename){\n//sysmod\n});');
      });

      it('should throw exception when redefining system module', function() {
        ss.client.assets.send('mod','sysmod','//sysmod');
        (function() {
          ss.client.assets.send('mod','sysmod','//sysmod');
        }).should.throw('System module name \'sysmod\' already exists');
      });
    });

});
