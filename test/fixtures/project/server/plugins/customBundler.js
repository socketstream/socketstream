'use strict';

module.exports = function customBundler(ss, client) {
	return ss.bundler.create({
	  define: define,
	  entries:entries
	});

	function define(paths) {

	  client.paths = ss.bundler.sourcePaths(paths);
	  client.constants = paths.constants || paths.consts;
	  client.locals = paths.locals;
	  client.entryInitPath = ss.bundler.findEntryPoint(client);

	  return ss.bundler.destsFor(client);
	}

	function entries() {
	  return [ss.bundler.browserifyLoader(), ss.bundler.systemLibs(), ss.bundler.systemModule('socketstream')];
	}
};