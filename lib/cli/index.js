// Parse commands from 'socketstream' binary
// There will be other commands in the future

exports.process = function(program) {
  switch (program.args[0]) {

    // Create a new project
    case 'new':
    case 'n':
      return require('./generate').generate(program);
    default:
      return console.log('Type "socketstream new <projectname>" to create a new application');
  }
};
