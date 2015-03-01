'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( path.join(process.env.PWD, 'lib/socketstream')),
    options = ss.client.options;

describe('default bundler', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

    describe('#entries', function () {

        beforeEach(function() {

            options.defaultEntryInit = origDefaultEntryInit;

            //ss.client.assets.unload();
            //ss.client.assets.load();
        });


        it('should return entries for everything needed in view', function() {

            //TODO set project root function
            ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

            var client = ss.client.define('abc', {
                code: './abc/index.js',
                view: './abc.html'
            });

            ss.client.load();

            var bundler = ss.api.bundler.get('abc'),
                entriesCSS = bundler.asset.entries('css'),
                entriesJS = bundler.asset.entries('js');

            entriesCSS.should.have.lengthOf(0);
            entriesJS.should.have.lengthOf(5);

            // libs
            entriesJS[0].names.should.have.lengthOf(1);
            entriesJS[0].names[0].should.be.equal('browserify.js');

            // mod
            entriesJS[1].name.should.be.equal('eventemitter2');
            entriesJS[1].type.should.be.equal('mod');

            // mod
            entriesJS[2].name.should.be.equal('socketstream');
            entriesJS[2].type.should.be.equal('mod');

            // mod TODO
            entriesJS[3].file.should.be.equal('./abc/index.js');
            //entriesJS[3].type.should.be.equal('mod');

            // start TODO
            entriesJS[4].content.should.be.equal('require("./code/abc/entry");');
            entriesJS[4].type.should.be.equal('start');


            //entriesJS.should.be.equal([{ path:'./abc.js'}]);
        });


        it('should return be affected by includes flags');


  });



});