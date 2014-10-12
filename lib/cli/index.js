// Parses commands from calling 'socketstream' on the CLI
//
'use strict';



// Dependencies
//
var generator = require('./generate');



/**
 * Processes the command line arguments passed to SocketStream
 *
 * @param  {[type]}   program  The commander program instance
 * @return {Void}
 */
exports.process = function (program) {
  switch (program.args[0]) {

    // Create a new project
    case 'new':
    case 'n':
      return generator.generate(program);
    default:
      return console.log('Type "socketstream new <projectname>" to create a new application');
  }
};