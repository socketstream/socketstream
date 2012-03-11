var copy, dir_mode, fs, log, makeRootDirectory, path, util;

log = console.log;

require('colors');

fs = require('fs');

path = require('path');

util = require('util');

copy = require('../utils/copy');

dir_mode = 0755;

exports.generate = function(program) {
  var copyOptions, name, source;
  name = program.args[1];
  if (name === void 0) {
    return console.log("Please provide a name for your application: $> socketstream new <MyAppName>");
  }
  if (makeRootDirectory(name)) {
    source = path.join(__dirname, '/../../new_project');
    copyOptions = {
      exclude: {
        inPaths: ['/client/code/app', '/server/middleware', '/server/rpc'],
        extensions: [program.coffee && '.js' || '.coffee']
      }
    };
    copy.recursiveCopy(source, name, copyOptions);
    log(("Success! Created app '" + name + "' with:").yellow);
    log("  ✓".green, "Our recommended stack of optional modules", "(minimal install option coming soon)".grey);
    if (program.coffee) {
      log("  ✓".green, "CoffeeScript example code", "(-j if you prefer Javascript)".grey);
    } else {
      log("  ✓".green, "Javascript example code", "(-c if you prefer CoffeeScript)".grey);
    }
    log("Next, run the following commands:".yellow);
    log("    cd " + name);
    log("    sudo npm install");
    log("    npm link socketstream", " (just until 0.3 is published to npm)".grey);
    log("To start your app:".yellow);
    return log("    node app.js");
  }
};

makeRootDirectory = function(name) {
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
