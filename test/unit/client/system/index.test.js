'use strict';

var path    = require('path'),
    ss      = require( path.join(process.env.PWD, 'lib/socketstream'));


describe('client system library', function () {


    describe('#send', function () {
        beforeEach(function() {

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
            jsAfter.content.should.have.length(jsBefore.content.length - 8854);
        });
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