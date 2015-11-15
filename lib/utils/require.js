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
return function(id, contextPath, defaultId) {
	var context = contexts[contextPath];
	if (context === undefined) {
		context = contexts[contextPath] = {
			rel : context,
			prefix: path.join(__dirname, '..', contextPath),
			inContext: function(id) {
				var p = path.join(context.prefix,id);
				if (fs.existsSync(p+'.js')) {
					return require(p);
				}
			}
		};
	}

	// builtin modules take first priority
	var inContext = context.inContext(id);
	if (inContext) { return inContext; }

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

	if (defaultId) {
		// default looked up in context first
		var defaultInContext = context.inContext(defaultId);
		if (defaultInContext) { return defaultInContext; }

		// all bets are off
		return hereOrParentRequire(defaultId);
	}
};
};

function hereOrParentRequire(id,returnNull) {

	for(var parent = module; parent; parent = parent.parent) {
		try {
			return parent.require(id);
		} catch(ex) {}
	}
	if (returnNull) {
		return null;
	}
	throw new Error('Cannot find module "' + id + '" from parent');
}


