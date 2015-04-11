'use strict';

var path    = require('path'),
    ss      = require( path.join('../../../..', 'lib/socketstream')),
    options = ss.client.options;

describe('client system library', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

    describe('#send', function () {
        beforeEach(function() {

            options.defaultEntryInit = origDefaultEntryInit;

            ss.client.assets.unload();
            ss.client.assets.load();
        });

        it('should extend libs',function() {

            var jsBefore, jsAfter;

            jsBefore = ss.api.bundler.systemLibs();
            jsBefore.should.be.type('object');
            jsBefore.type.should.be.equal('loader');
            ss.client.assets.send('lib','extra.js','var extra = 0;');
            jsAfter = ss.api.bundler.systemLibs();
            jsAfter.should.be.type('object');
            jsAfter.content.should.have.length(jsBefore.content.length + 1 + 14);
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
    });



    describe('#load', function () {



    });



    describe('#serve', function () {



        describe('#js', function () {



        });



        describe('#initCode', function () {



        });



    });



});
