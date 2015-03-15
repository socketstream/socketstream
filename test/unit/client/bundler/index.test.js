'use strict';

var path    = require('path'),
    should  = require('should'),
    ss      = require( '../../../../lib/socketstream'),
    options = ss.client.options;

describe('bundler', function () {

  //TODO set project root function

  ss.root = ss.api.root = path.join(__dirname, '../../../fixtures/project');

  options.liveReload = false;

  describe('API',function() {

    afterEach(function() {
      ss.client.forget();
    });

    it('should resolve paths in default dirs',function() {
      var paths = ss.api.bundler.sourcePaths({
        css: 'main.css',
        code: 'main.js',
        tmpl: 'main.html'
      });

      paths.css.should.eql(['./css/main.css']);
      paths.code.should.eql(['./code/main.js']);
      paths.tmpl.should.eql(['./templates/main.html']);
    });

    it('should return bundler given id', function() {
      var client = ss.client.define('abc', { view: 'abc.html' });

      var bundler = ss.api.bundler.get({ client: 'abc' });
      bundler.should.be.type('object');
      bundler.client.should.equal(client);
    });

    it('should look up bundler by id', function() {
      var client = ss.client.define('abc', { view: 'abc.html' });

      var bundler = ss.api.bundler.get({ ts: client.id });
      bundler.should.be.type('object');
      bundler.client.should.equal(client);
    });

    it('should throw odd bundler lookups', function() {
      var client = ss.client.define('abc', { view: 'abc.html' });

      should(function() {
        ss.api.bundler.get({ ts: 'abc' });
      }).throw(Error);
    });

    it('should throw if defined twice', function() {
      ss.client.define('abc', { view: 'abc.html' });

      should(function() {
        ss.client.define('abc', { view: 'abc.html' });
      }).throw(Error);
    });

    it('should set client options piecemeal', function() {
      ss.client.set({ 'a':'a'});
      options.a.should.equal('a');
      ss.client.set({ 'b':'b'});
      options.b.should.equal('b');
      ss.client.set({ 'b':'B'});
      options.b.should.equal('B');
    });
  });

});
