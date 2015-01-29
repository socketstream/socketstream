
// Define our eval outside of the scope of any other reference defined in this
// file to avoid adding those references to the evaluation scope.
function __eval(__source, __global, load) {
  // Hijack System.register to set declare function
  var __curRegister = System.register;
  System.register = function(name, deps, declare) {
    if (typeof name != 'string') {
      declare = deps;
      deps = name;
    }
    // store the registered declaration as load.declare
    // store the deps as load.deps
    load.declare = declare;
    load.depsList = deps;
  }
  try {
    eval('(function() { var __moduleName = "' + (load.name || '').replace('"', '\"') + '"; ' + __source + ' \n }).call(__global);');
  }
  catch(e) {
    if (e.name == 'SyntaxError' || e.name == 'TypeError')
      e.message = 'Evaluating ' + (load.name || load.address) + '\n\t' + e.message;
    throw e;
  }

  System.register = __curRegister;
}

})(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ?
                                           self : global));
