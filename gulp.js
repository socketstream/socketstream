// Entry point for gulpfile.js

// Load SocketStream core
var ss = module.exports = require('./lib/socketstream.js'),
    gulp = ss.api.require('gulp');

// gulp is used as the Orchestrator
ss.tasks.use(gulp);

// Your app.js should be required from the gulpfile.js
// .start() will normally be called from app.js, and will not run tasks.
ss.start = function() {};

// default tasks are defined
ss.tasks.defaults();

// don't load API yet as the app.js still needs to be loaded
