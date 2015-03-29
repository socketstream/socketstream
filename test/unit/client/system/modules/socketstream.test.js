'use strict';

var path    = require('path'),
    ss      = require( path.join('../../../../..', 'lib/socketstream'));


describe('socketstream client library', function () {



    describe('#assignTransport', function () {



    });



    describe('#registerApi', function () {



    });



    describe('#send', function () {

        it('should extend mods',function() {

            ss.client.assets.send('mod','extra.js','var extra = 0;');
            var extra = ss.api.bundler.systemModule('extra.js',false);
            extra.should.be.type('object');
            extra.name.should.be.equal('extra');
            extra.file.should.be.equal('extra');
            extra.path.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules/','extra.js'));
            extra.dir.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules'));
            extra.content.should.be.equal('var extra = 0;');

            var extra = ss.api.bundler.systemModule('extra.js');
            extra.should.be.type('object');
            extra.name.should.be.equal('extra');
            extra.file.should.be.equal('extra');
            extra.path.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules/','extra.js'));
            extra.dir.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules'));
            extra.content.should.be.equal('require.define("extra", function (require, module, exports, __dirname, __filename){\n' +
            'var extra = 0;\n});');
        });

        it('should replace mods',function() {

            ss.client.assets.send('mod','extra.js','var extra = 0;');
            ss.client.assets.send('mod','extra.js','var extra2 = 100;');
            var extra = ss.api.bundler.systemModule('extra.js',false);
            extra.should.be.type('object');
            extra.name.should.be.equal('extra');
            extra.file.should.be.equal('extra');
            extra.path.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules/','extra.js'));
            extra.dir.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules'));
            extra.content.should.be.equal('var extra2 = 100;');

            var extra = ss.api.bundler.systemModule('extra.js');
            extra.should.be.type('object');
            extra.name.should.be.equal('extra');
            extra.file.should.be.equal('extra');
            extra.path.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules/','extra.js'));
            extra.dir.should.be.equal(path.join(process.env.PWD,'lib/client/system/modules'));
            extra.content.should.be.equal('require.define("extra", function (require, module, exports, __dirname, __filename){\n' +
            'var extra2 = 100;\n});');
        });
    });



    describe('#load', function () {



        describe('#code', function () {



        });



        describe('#worker', function () {



        });



    });



    describe('when ss reload event is received', function () {



    });



    describe('when ss update CSS event is received', function () {



    });



});
