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

        it('should return the code formatters API',function() {
          ss.client.formatters.add.should.be.type('function');
          ss.client.formatters.load.should.be.type('function');
        });

    });



    describe('#templateEngine', function () {

        it('should return the templateEngine API', function() {
          ss.client.templateEngine.use.should.be.type('function');
          ss.client.templateEngine.load.should.be.type('function');
          ss.client.templateEngine.generate.should.be.type('function');
        });

    });



    describe('#systemAssets', function () {

        it('should return the system assets API', function() {
          ss.client.assets.send.should.be.type('function');
          ss.client.assets.load.should.be.type('function');
          ss.client.assets.unload.should.be.type('function');
          ss.client.assets.assets.should.be.type('object');
        });

    });



    describe('#options', function () {

        it('should return an object specifying the app\'s options', function() {
          ss.client.options.should.be.type('object');
        });

    });



    describe('#set', function () {



        it('should allow the user to overwrite the existing options');



    });



    describe('#packAssets', function () {

        options.packedAssets = true;

        it('should tell the asset manager to pack and minimise all assets', function() {

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

        options.packedAssets = false;

        it('should return a client object containing a name, and the paths of all the files it has');



        it('should throw an error if the name has already been used');



        it('should throw an error if more than one HTML view is defined');



        it('should throw an error if the html view is not a valid html template');



    });



    describe('#load', function () {

        options.packedAssets = false;

        it('should listen for incoming asset requests');



        it('should load existing pre-packed assets, if they exist');



        it('should re-pack assets in case they do not exist');



        it('should otherwise serve files directly, and watch for changes to those files');



        it('should also listen out for request to asynchronously load new assets');



    });

    var view = require('../../../lib/client/view');

    describe('unpacked #view',function() {

      beforeEach(function() {

        // back to initial client state
        ss.client.unload();
        ss.client.assets.unload();
        ss.client.forget();

        ss.client.formattes.add('css');
        ss.client.formattes.add('javascript');
        ss.client.formattes.add('map');
        ss.client.formattes.add('html');

        ss.client.assets.load();

        // options and load client
        options.packedAssets = false;
        ss.client.load();
      });

      afterEach(function() {
        ss.client.unload();
      });

      it('should render the SS view');

    });

    describe('packed #view', function() {


        beforeEach(function() {

          // back to initial client state
          ss.client.unload();
          ss.client.assets.unload();
          ss.client.forget();

          ss.client.formatters.add('css');
          ss.client.formatters.add('javascript');
          ss.client.formatters.add('map');
          ss.client.formatters.add('html');

          ss.client.assets.load();

          // options and load client
          options.packedAssets = true;
          ss.client.load();
        });

        afterEach(function() {
          ss.client.unload();
        });

        it('should render the ABC view (with start)', function(done) {
          var expectedHtml = '<html>\n' +
            '<head><title>ABC</title></head>\n' +
            '<body><p>ABC</p><script>require("./code/abc/entry");</script></body>\n' +
            '</html>';

          var client = ss.client.define('abc', {
            css: './abc/style.css',
            code: './abc/index.js',
            view: './abc/abc.html'
          });

          view(ss.api, client, options, function (output) {
            output.should.equal(expectedHtml);
            done();
          });

        } );

        it('should render the ABC view (without start)', function(done) {

          var expectedHtml = '<html>\n' +
            '<head><title>ABC</title></head>\n' +
            '<body><p>ABC</p></body>\n' +
            '</html>';

          options.startInBundle = true;

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

      it('should render the SS view (with start)', function(done) {
        var client = ss.client.define('abc', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/ss.html'
        });

        var expectedHtml = ('<html>\n' +
        '<head><title>ABC</title>' +
        '<link href="/assets/abc/m1bf9lApd.css" media="screen" rel="stylesheet" type="text/css">' +
        '<script src="/assets/abc/m1bf9lApd.js" type="text/javascript"></script>' + '</head>\n' +
        '<body><p>ABC</p><script>require("./code/abc/entry");</script></body>\n' +
        '</html>\n').replace(/m1bf9lApd/g, client.id);

        view(ss.api, client, options, function (output) {
          output.should.equal(expectedHtml);
          done();
        });

      });
      it('should render SS view (without start)', function(done) {
        options.startInBundle = true;

        var client = ss.client.define('abc', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/ss.html'
        });

        var expectedHtml = ('<html>\n' +
          '<head><title>ABC</title>' +
          '<link href="/assets/abc/m1bf9lApd.css" media="screen" rel="stylesheet" type="text/css">' +
          '<script src="/assets/abc/m1bf9lApd.js" type="text/javascript"></script><script>require("./code/abc/entry");</script>'+ '</head>\n' +
          '<body><p>ABC</p></body>\n' +
          '</html>\n').replace(/m1bf9lApd/g,client.id);

        view(ss.api, client, options, function(output) {
          output.should.equal(expectedHtml);
          done();
        });
      });

      it('should render the SS view without CSS if include is false', function(done) {
        var client = ss.client.define('abc', {
          includes: {css:false},
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/ss.html'
        });

        var expectedHtml = ('<html>\n' +
          '<head><title>ABC</title>' +
          '<script src="/assets/abc/m1bf9lApd.js" type="text/javascript"></script>'+ '</head>\n' +
          '<body><p>ABC</p><script>require("./code/abc/entry");</script></body>\n' +
          '</html>\n').replace(/m1bf9lApd/g,client.id);

        view(ss.api, client, options, function(output) {
          output.should.equal(expectedHtml);
          done();
        });
      });
    });

});


