var copy, dir_mode, fs, log, makeRootDirectory, showFinishText, util;

log = console.log;

fs = require('fs');

util = require('util');

copy = require('../utils/copy');

dir_mode = 0755;

exports.generate = function(name) {
  var source;
  if (name === void 0) {
    return console.log("Please provide a name for your application: $> socketstream new <MyAppName>");
  }
  if (makeRootDirectory(name)) {
    source = __dirname + '/../../new_project';
    copy.recursiveCopy(source, name);
    return showFinishText(name);
  }
};

makeRootDirectory = function(name) {
  log("Creating a new SocketStream app called " + name);
  try {
    fs.mkdirSync(name, dir_mode);
    return true;
  } catch (e) {
    if (e.code === 'EEXIST') {
      log("Sorry the '" + name + "' directory already exists. Please choose another name for your app.");
      return false;
    } else {
      throw e;
    }
  }
};

showFinishText = function(name) {
  log("Success! Created app " + name + ". You can now run the app:");
  log("\t\t cd " + name);
  log("\t\t npm install");
  log("\t\t npm link socketstream    (until 0.3 is published to npm)");
  return log("\t\t node app.js");
};
