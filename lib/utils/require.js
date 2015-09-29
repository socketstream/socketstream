'use strict';

var path = require('path'),
	fs = require('fs'),
	resolve = require('resolve'),
	contexts = {};

module.exports = function(ss) {
	/*
	 * Require a module by id that is located.
	 * - builtin module in context
	 * - module relative to app.js
	 * - module in socketstream, in project or above
	 * - the default module
	 *
	 * Currently only support .js files
	 *
	 * Currently doesn't cache anything. It could cache builtin names.
	 * Or it could remember the result of a call.

	 * @param {function} callback The third parameter can be a callback function called when the 
	 module isn't found. If it returns something that will be the resolved module.
	 */
	function requires(id, contextPath, defaultId) {
		var context, callback;
		if (typeof defaultId === 'function') {
			callback = defaultId;
			defaultId = null;
		}
		if (contextPath) {
			context = contexts[contextPath];
			if (context === undefined) {
				context = contexts[contextPath] = {
					rel : context,
					prefix: path.join(__dirname, '..', contextPath),
					inContext: function(id) {
						try {
							var p = path.join(context.prefix,id);
							if (require.resolve(p)) { // gives full path
								return require(p);
							}
						} catch(ex) {}
					}
				};
			}

			// builtin modules take first priority
			var inContext = context.inContext(id);
			if (inContext) { return inContext; }
		}

		if (typeof id !== 'string') {
			return id; // straight object/function will just resolve straight away
		}

		// if relative base on main script location
		if (id.charAt(0) === '.') {
			var inProject = path.join(ss.root,id);
			if (fs.existsSync(inProject+'.js')) {
				return require(inProject);
			}
		}

		// getting a packaged module
		var module = hereOrProjectRequire(id,ss.root);
		if (module) { return module; }

		if (context && defaultId) {
			// default looked up in context first
			var defaultInContext = context.inContext(defaultId);
			if (defaultInContext) { return defaultInContext; }

			// all bets are off
			return hereOrProjectRequire(defaultId,ss.root);
		}

		if (callback) {
			return callback({
				id:id
			});
		}
		throw new Error('Cannot find module "' + id + '" in socketstream or project');
	}
	//TODO requires.resolve =
	return requires;
};

function hereOrProjectRequire(id,root) {
	var here = path.join(__dirname,'..','..');
	try {
		var p = resolve.sync(id, {
			package: path.join(here,'package.json'),
			paths: [here],
			basedir:here
		});
		return require(p);
	} catch(ex) {
		// console.error(ex);
	}
	try {
		return require(resolve.sync(id, {
			package: path.join(root,'package.json'),
			paths: [root],
			basedir:root
		}));
	} catch(ex) {
		// console.error(ex);
	}
}


