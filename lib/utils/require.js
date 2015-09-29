'use strict';

var path = require('path'),
	fs = require('fs'),
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
 */
function requires(id, contextPath, defaultId) {
	var context;
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
	var module = hereOrParentRequire(id,!!defaultId);
	if (module) { return module; }

	if (context && defaultId) {
		// default looked up in context first
		var defaultInContext = context.inContext(defaultId);
		if (defaultInContext) { return defaultInContext; }

		// all bets are off
		return hereOrParentRequire(defaultId);
	}
}
	//TODO requires.resolve =
	return requires;
};

function hereOrParentRequire(id,returnNull) {

	for(var mod = module.parent.parent; mod; mod = mod.parent) {
		try {
      return mod.require(id);
		} catch(ex) {}
	}
	if (returnNull) {
		return null;
	}
	throw new Error('Cannot find module "' + id + '" from parent');
}


