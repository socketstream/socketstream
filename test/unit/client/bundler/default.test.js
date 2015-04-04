'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( '../../../../lib/socketstream'),
    viewer  = require( '../../../../lib/client/view'),
    options = ss.client.options,
    defineAbcClient = require('../abcClient');

describe('default bundler', function () {

    var origDefaultEntryInit = options.defaultEntryInit;

    //TODO set project root function

    ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');
    //ss.api.bundler = require('../../../../lib/client/bundler/index')(ss.api,options);

  options.liveReload = false;

  describe('client with standard css+code', function() {

    var client;

    beforeEach(function() {
      client = ss.client.define('main', {
        css: 'main',
        code: 'main/demo.coffee',
        view: 'main.jade'
      });
    });

    afterEach(function() {
      ss.client.forget();
    });

    it('should support default asset source and dest locations', function() {

      client.id.should.be.type('string');

      client.paths.should.be.type('object');
      client.paths.css.should.be.eql(['./css/main']);
      client.paths.code.should.be.eql(['./code/main/demo.coffee']);
      client.paths.view.should.be.eql('./views/main.jade');
      client.paths.tmpl.should.be.eql([]);

      client.entryInitPath.should.be.equal('/code/main/demo');

      var bundler = ss.api.bundler.get('main');

      bundler.dests.urls.html.should.be.equal('/assets/main/' + client.id + '.html');
      bundler.dests.urls.css.should.be.equal('/assets/main/' + client.id + '.css');
      bundler.dests.urls.js.should.be.equal('/assets/main/' + client.id + '.js');

      bundler.dests.dir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets', client.name));
      bundler.dests.containerDir.should.be.equal(path.join(ss.root, 'client', 'static', 'assets'));
    });

    it('should set default include flags to true', function() {
      client.includes.should.be.type('object');
      client.includes.css.should.be.equal(true);
      client.includes.html.should.be.equal(true);
      client.includes.system.should.be.equal(true);
      client.includes.initCode.should.be.equal(true);
    });

  });

  describe('client with relative css+code+tmpl', function() {

    var client;

    beforeEach(function() {
      client = ss.client.define('main', {
        css: './css/main',
        code: './code/main/demo.coffee',
        view: './views/main.jade',
        tmpl: './templates/chat/message.jade'
      });
    });

    afterEach(function() {
      ss.client.forget();
    });

    it('should support default asset source locations', function() {

      client.id.should.be.type('string');

      client.paths.should.be.type('object');
      client.paths.css.should.be.eql(['./css/main']);
      client.paths.code.should.be.eql(['./code/main/demo.coffee']);
      client.paths.view.should.be.eql('./views/main.jade');
      client.paths.tmpl.should.be.eql(['./templates/chat/message.jade']);
    });
  });

  describe('define code entry point', function() {

    afterEach(function() {
      ss.client.forget();
    });

    it('should pick ./entry in first module if present', function() {

      var client = ss.client.define('abc', {
        css: 'main',
        code: ['kickoff','main/demo.coffee'],
        view: 'main.jade'
      });
      client.entryInitPath.should.equal('/code/kickoff/entry');
    });

    it('should pick ./entry in second module if present, and not in first', function() {

      var client = ss.client.define('abc', {
        css: 'main',
        code: ['extras','kickoff','main/demo.coffee'],
        view: 'main.jade'
      });
      client.entryInitPath.should.equal('/code/kickoff/entry');
    });
  });

    describe('define', function() {

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

        client.entryInitPath.should.be.equal('/abc/index');

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
        client.includes.css.should.equal(true);
        client.includes.system.should.equal(true);
        client.includes.initCode.should.equal(true);
        client.includes.html.should.equal(true);

        client = ss.client.define('abc-no-overrides', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html',
          includes: { }
        });

        client.includes.should.be.type('object');
        client.includes.css.should.equal(true);
        client.includes.system.should.equal(true);
        client.includes.initCode.should.equal(true);
        client.includes.html.should.equal(true);

        client = ss.client.define('abc-false-overrides', {
          css: './abc/style.css',
          code: './abc/index.js',
          view: './abc/abc.html',
          includes: { css:false, system:false, initCode:false, html:false }
        });

        client.includes.should.be.type('object');
        client.includes.css.should.equal(false);
        client.includes.system.should.equal(false);
        client.includes.initCode.should.equal(false);
        client.includes.html.should.equal(false);

      });
    });

    afterEach(function() {
        ss.client.forget();
    });

    describe('#entries', function () {

        beforeEach(function() {

            options.defaultEntryInit = origDefaultEntryInit;

            ss.client.assets.unload();
            ss.client.forget();
            ss.client.assets.load();
        });

        it('should report erroneous paths in an easy way');

        it('should return entries for everything needed in view with just css', function() {

          defineAbcClient({
            code: undefined
          },function() {
          });

          var bundler = ss.api.bundler.get('abc'),
            entriesCSS = bundler.entries('css'),
            entriesJS = bundler.entries('js');

          entriesCSS.should.have.lengthOf(1);
          entriesJS.should.have.lengthOf(3);

          // css entries
          entriesCSS[0].file.should.be.equal('./abc/style.css');
          entriesCSS[0].importedBy.should.be.equal('./abc/style.css');
        });

      it('should return no entries for css if not in includes', function() {

        defineAbcClient({
          includes: { css:false },
          code: undefined
        },function() {
        });

        var bundler = ss.api.bundler.get('abc'),
          entriesCSS = bundler.entries('css'),
          entriesJS = bundler.entries('js');

        entriesCSS.should.have.lengthOf(0);
        entriesJS.should.have.lengthOf(3);
      });

      it('should return entries for everything needed in view with just code', function() {

        defineAbcClient({
          css: undefined
        },function() {
        });

        var bundler = ss.api.bundler.get('abc'),
            entriesCSS = bundler.entries('css'),
            entriesJS = bundler.entries('js');

        entriesCSS.should.have.lengthOf(0);
        entriesJS.should.have.lengthOf(4);

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

        //entriesJS.should.be.equal([{ path:'./abc.js'}]);
    });

      it('should return entries for everything needed in view with startInBundle', function() {

        options.startInBundle = true;

        defineAbcClient({
        },function() {
        });

        var bundler = ss.api.bundler.get('abc'),
          entriesCSS = bundler.entries('css'),
          entriesJS = bundler.entries('js');

        entriesCSS.should.have.lengthOf(1);
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
        entriesJS[4].content.should.be.equal('require("/abc/index");');
        entriesJS[4].type.should.be.equal('start');
      });

      it('should return entries for JS flagged in includes', function() {

        defineAbcClient({
          includes: { system:false, initCode: false, css:false}
        },function() {
        });

        var bundler = ss.api.bundler.get('abc'),
          entriesCSS = bundler.entries('css'),
          entriesJS = bundler.entries('js');

        entriesCSS.should.have.lengthOf(0);
        entriesJS.should.have.lengthOf(1);

        // mod TODO
        entriesJS[0].file.should.be.equal('./abc/index.js');
        entriesJS[0].importedBy.should.be.equal('./abc/index.js');
      });

      it('should render css asset file as empty if includes is false');

      it('should not put css in entries if includes is false');

      it('should exclude system from js asset file if includes is false');

      it('should not put sytem in entries if includes is false');
  });

  //TODO locals set in different ways

  describe('constants', function() {

    beforeEach(function() {

      options.defaultEntryInit = origDefaultEntryInit;
      options.startInBundle = false;

      ss.client.assets.unload();
      ss.client.forget();
      ss.client.assets.load();

      ss.client.formatters.add('html');
    });

    /*
    it('should put global constants in html', function() {

      var client = ss.client.define('abc', {
        code: './abc/index.js',
        view: './abc/abc.html'
      });

      ss.api.client.send('constant', 'abcg', {a:'a'});

      ss.client.load();

      viewer(ss.api, client, options, function (html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p><script>var abcg={"a":"a"};\nrequire("/abc/");</script></body>',
          '</html>'
        ].join('\n'))
      });
    });
    */

    it('should put specific constants in html', function() {

      var client = defineAbcClient({
        constants: {
          abcl: {
            "b":"b"
          }
        }
      },function() {
      });

      viewer(ss.api, client, options, function (html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p><script>var abcl={"b":"b"};\nrequire("/abc/index");</script></body>',
          '</html>'
        ].join('\n'))
      });
    });

    it('should put global and specific constants in html', function(done) {

      var client = defineAbcClient({
        constants: {
          abcl: {
            "b":"b"
          }
        }
      },function() {
        ss.api.client.send('constant', 'abcg', {a:'a'});
      });

      viewer(ss.api, client, options, function (html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p><script>var abcg={"a":"a"};\nvar abcl={"b":"b"};\nrequire("/abc/index");</script></body>',
          '</html>'
        ].join('\n'))
        done();
      });
    });

    it('should replace global with specific constants in html', function() {

      var client = defineAbcClient({
        constants: {
          abcg: {
            "b":"b"
          }
        }
      },function() {
        ss.api.client.send('constant', 'abcg', {a:'a'});
      });

      //breaks because old stuff hangs around

      viewer(ss.api, client, options, function (html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p><script>var abcg={"b":"b"};\nrequire("/abc/index");</script></body>',
          '</html>'
        ].join('\n'))
      });
    });

  });

  describe('html',function() {

    beforeEach(function() {

      options.defaultEntryInit = origDefaultEntryInit;
      options.startInBundle = false;

      ss.client.assets.unload();
      ss.client.forget();
      ss.client.assets.load();

      ss.client.formatters.add('html');
    });

    it('should contain templates in the html',function() {

    });

    it('should contain a tail script by default',function() {

      var client = defineAbcClient({
      },function() {
      });

      viewer(ss.api, client, options, function (html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p><script>require("/abc/index");</script></body>',
          '</html>'
        ].join('\n'))
      });

    });

    it('should not contain a tail script with startInBundle option',function() {

      options.startInBundle = true;

      var client = defineAbcClient({
        includes: { system:false, initCode: false}
      },function() {
      });

      viewer(ss.api, client, options, function(html) {
        html.should.be.type('string');
        html.should.equal([
          '<html>',
          '<head><title>ABC</title></head>',
          '<body><p>ABC</p></body>',
          '</html>'
        ].join('\n'))
      });

    });

  });

  describe('pack', function() {

    it('should define modules importedBy correctly with pathPrefix');
  });

});
