'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( '../../../../lib/socketstream'),
    options = ss.client.options;

describe('default bundler', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

    //TODO set project root function

    ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');


    describe('define', function() {

      it('should support default css/code/view/tmpl locations',function() {
        var client = ss.client.define('main', {
          css: 'main',
          code: 'main/demo.coffee',
          view: 'main.jade'
        });

        client.id.should.be.type('string');

        client.paths.should.be.type('object');
        client.paths.css.should.be.eql(['./css/main']);
        client.paths.code.should.be.eql(['./code/main/demo.coffee']);
        client.paths.view.should.be.eql('./views/main.jade');
        client.paths.tmpl.should.be.eql([]);

        client.entryInitPath.should.be.equal('./code/main/entry');

        var bundler = ss.api.bundler.get('main');

        bundler.dests.urls.html.should.be.equal('/assets/main/' + client.id + '.html');
        bundler.dests.urls.css.should.be.equal('/assets/main/' + client.id + '.css');
        bundler.dests.urls.js.should.be.equal('/assets/main/' + client.id + '.js');

        bundler.dests.dir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', client.name));
        bundler.dests.containerDir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets'));
      });

      it('should support relative css/code/view/tmpl locations', function() {
        var client = ss.client.define('main', {
          css: './css/main',
          code: './code/main/demo.coffee',
          view: './views/main.jade',
          tmpl: './templates/chat/message.jade'
        });

        client.id.should.be.type('string');

        client.paths.should.be.type('object');
        client.paths.css.should.be.eql(['./css/main']);
        client.paths.code.should.be.eql(['./code/main/demo.coffee']);
        client.paths.view.should.be.eql('./views/main.jade');
        client.paths.tmpl.should.be.eql(['./templates/chat/message.jade']);

      });

      it('should set up client and bundler', function () {

        var client = ss.client.define('abc', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html'
        });

        client.id.should.be.type('string');

        client.paths.should.be.type('object');
        client.paths.css.should.be.eql(['./abc/style.css']);
        client.paths.code.should.be.eql(['./abc/index.js']);
        client.paths.view.should.be.eql('./abc/abc.html');
        client.paths.tmpl.should.be.eql([]);

        client.includes.should.be.type('object');
        client.includes.css.should.be.equal(true);
        client.includes.html.should.be.equal(true);
        client.includes.system.should.be.equal(true);
        client.includes.initCode.should.be.equal(true);
        client.entryInitPath.should.be.equal('./code/abc/entry');

        var bundler = ss.api.bundler.get('abc');

        bundler.dests.paths.html.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', 'abc', client.id + '.html'));
        bundler.dests.paths.css.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', 'abc', client.id + '.css'));
        bundler.dests.paths.js.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', 'abc', client.id + '.js'));

        bundler.dests.relPaths.html.should.be.equal(path.join('/client', 'static', 'assets', 'abc', client.id + '.html'));
        bundler.dests.relPaths.css.should.be.equal(path.join('/client', 'static', 'assets', 'abc', client.id + '.css'));
        bundler.dests.relPaths.js.should.be.equal(path.join('/client', 'static', 'assets', 'abc', client.id + '.js'));

        bundler.dests.urls.html.should.be.equal('/assets/abc/' + client.id + '.html');
        bundler.dests.urls.css.should.be.equal('/assets/abc/' + client.id + '.css');
        bundler.dests.urls.js.should.be.equal('/assets/abc/' + client.id + '.js');

        bundler.dests.dir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', client.name));
        bundler.dests.containerDir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets'));


        //client.id = shortid.generate();
      });

      it('should set up client with includes', function () {

        var client = ss.client.define('abc', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html'
        });

        client.includes.should.be.type('object');
        client.includes.css.should.be.true;
        client.includes.system.should.be.true;
        client.includes.initCode.should.be.true;
        client.includes.html.should.be.true;

        var client = ss.client.define('abc-no-overrides', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html',
          includes: { }
        });

        client.includes.should.be.type('object');
        client.includes.css.should.be.true;
        client.includes.system.should.be.true;
        client.includes.initCode.should.be.true;
        client.includes.html.should.be.true;

        var client = ss.client.define('abc-false-overrides', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html',
          includes: { css:false, system:false, initCode:false, html:false }
        });

        client.includes.should.be.type('object');
        client.includes.css.should.be.false;
        client.includes.system.should.be.false;
        client.includes.initCode.should.be.false;
        client.includes.html.should.be.false;

      });
    });

    afterEach(function() {
        ss.client.forget();
    });

    describe('#entries', function () {

        beforeEach(function() {

            options.defaultEntryInit = origDefaultEntryInit;

            ss.client.assets.unload();
            ss.client.assets.load();
        });

        it('should report erroneous paths in an easy way');

        it('should return entries for everything needed in view with just css', function() {

          var client = ss.client.define('abc', {
            css: './abc/style.css',
            view: './abc/abc.html'
          });

          ss.client.load();

          var bundler = ss.api.bundler.get('abc'),
            entriesCSS = bundler.asset.entries('css'),
            entriesJS = bundler.asset.entries('js');

          entriesCSS.should.have.lengthOf(1);
          entriesJS.should.have.lengthOf(4);

          // css entries
          entriesCSS[0].file.should.be.equal('./abc/style.css');
          entriesCSS[0].importedBy.should.be.equal('./abc/style.css');
        });

      it('should return no entries for css if not in includes', function() {

        var client = ss.client.define('abc', {
          includes: { css:false },
          css: './abc/style.css',
          view: './abc/abc.html'
        });

        ss.client.load();

        var bundler = ss.api.bundler.get('abc'),
          entriesCSS = bundler.asset.entries('css'),
          entriesJS = bundler.asset.entries('js');

        entriesCSS.should.have.lengthOf(0);
        entriesJS.should.have.lengthOf(4);
      });

      it('should return entries for everything needed in view with just code', function() {

            var client = ss.client.define('abc', {
                code: './abc/index.js',
                view: './abc/abc.html'
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
            entriesJS[3].importedBy.should.be.equal('./abc/index.js');
            //entriesJS[3].type.should.be.equal('mod');

            // start TODO
            entriesJS[4].content.should.be.equal('require("./code/abc/entry");');
            entriesJS[4].type.should.be.equal('start');


            //entriesJS.should.be.equal([{ path:'./abc.js'}]);
        });

      it('should return entries for JS flagged in includes', function() {

        var client = ss.client.define('abc', {
          includes: { system:false, initCode: false},
          code: './abc/index.js',
          view: './abc/abc.html'
        });

        ss.client.load();

        var bundler = ss.api.bundler.get('abc'),
          entriesCSS = bundler.asset.entries('css'),
          entriesJS = bundler.asset.entries('js');

        entriesCSS.should.have.lengthOf(0);
        entriesJS.should.have.lengthOf(1);

        // mod TODO
        entriesJS[0].file.should.be.equal('./abc/index.js');
        entriesJS[0].importedBy.should.be.equal('./abc/index.js');
      });
  });



});
