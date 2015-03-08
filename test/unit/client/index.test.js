'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( '../../../lib/socketstream'),
    options = ss.client.options;


describe('client asset manager index', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

    afterEach(function() {
      ss.client.forget();
    });


    describe('#formatters', function () {



        it('should return the code formatters API');



    });



    describe('#templateEngine', function () {



        it('should return the templateEngine API');



    });



    describe('#systemAssets', function () {



        it('should return the system assets API');



    });



    describe('#options', function () {



        it('should return an object specifying the app\'s options');



    });



    describe('#set', function () {



        it('should allow the user to overwrite the existing options');



    });



    describe('#packAssets', function () {



        it('should tell the asset manager to pack and minimise all assets', function() {

            options.packedAssets = true;

            //TODO set project root function
            ss.root = ss.api.root = path.join(__dirname, '../../fixtures/project');

            var client = ss.client.define('abc', {
                code: './abc/index.js',
                view: './abc.html'
            });

            //ss.client.load();

        });



    });



    describe('#define', function () {



        it('should return a client object containing a name, and the paths of all the files it has');



        it('should throw an error if the name has already been used');



        it('should throw an error if more than one HTML view is defined');



        it('should throw an error if the html view is not a valid html template');



    });



    describe('#load', function () {



        it('should listen for incoming asset requests');



        it('should load existing pre-packed assets, if they exist');



        it('should re-pack assets in case they do not exist');



        it('should otherwise serve files directly, and watch for changes to those files');



        it('should also listen out for request to asynchronously load new assets');



    });

    var view = require('../../../lib/client/view');

    describe('#view', function() {

        beforeEach(function() {

          options.defaultEntryInit = origDefaultEntryInit;

          ss.client.load();
          ss.client.assets.unload();
          ss.client.assets.load();
          ss.client.load();
        });

        afterEach(function() {
          ss.client.unload();
        });

        var expectedHtml = '<html>\n' +
          '<head><title>ABC</title></head>\n' +
          '<body><p>ABC</p></body>\n' +
          '</html>';

        it('should render the ABC view', function(done) {
          var client = ss.client.define('abc', {
            css: './abc/style.css',
            code: './abc/index.js',
            view: './abc/abc.html'
          });

          view(ss.api, client, options, function(output) {
            output.should.equal(expectedHtml);
            done();
          });

        });
    });

});
