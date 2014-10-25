'use strict';

var path = require('path'),
    should = require('should'),
    ss = require( path.join(process.env.PWD, 'lib/socketstream') );


describe('client system library', function () {



    describe('#send', function () {
        beforeEach(function() {

            ss.client.assets.unload();
            ss.client.assets.load();
        });

        it('should extend shims',function() {

            var jsBefore = ss.client.assets.serve.js();
            ss.client.assets.send('shim','extra.js','var extra = 0;');
            var jsAfter = ss.client.assets.serve.js();
            jsAfter.should.have.length(jsBefore.length + 1 + 14);
        });

        it('should replace shims',function() {

            var jsBefore = ss.client.assets.serve.js();
            ss.client.assets.send('shim','json.min.js','');
            var jsAfter = ss.client.assets.serve.js();
            jsAfter.should.have.length(jsBefore.length - 1886);
        });

        it('should extend libs',function() {

            var jsBefore = ss.client.assets.serve.js();
            ss.client.assets.send('lib','extra.js','var extra = 0;');
            var jsAfter = ss.client.assets.serve.js();
            jsAfter.should.have.length(jsBefore.length + 1 + 14);
        });

        it('should replace libs',function() {

            var jsBefore = ss.client.assets.serve.js();
            ss.client.assets.send('lib','browserify.js','');
            var jsAfter = ss.client.assets.serve.js();
            jsAfter.should.have.length(jsBefore.length - 8854);
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