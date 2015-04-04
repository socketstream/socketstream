/*
 Example of a custom strategy for serving HTTP assets
 */
'use strict';
var defaultStrategy = require('./default.strategy');

exports.init = defaultStrategy.init;
exports.load = defaultStrategy.load;
exports.cookieParser = defaultStrategy.cookieParser;
exports.favicon = defaultStrategy.favicon;
exports.session = defaultStrategy.session;
exports.sessionCookie = {
  name: 'JSESSIONID'
};
exports.isStatic = defaultStrategy.isStatic;

