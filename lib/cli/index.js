
exports.process = function(args) {
  switch (args[0]) {
    case 'new':
    case 'n':
      return require('./generate').generate(args[1]);
    default:
      return console.log('Type "socketstream new <projectname>"" to create a new application');
  }
};
