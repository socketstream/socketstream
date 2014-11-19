
var defaultBundler,
    bundlers = {}; // get bundler by client name

/**
 * Define the bundler for a client
 * @param client object to store the definition in
 * @param args arguments passed to define
 */
exports.define = function bundler(ss,client,args,options) {

  var name = args[0], 
      pathsOrFunc = args[1];

  defaultBundler = defaultBundler || require('./default')(ss,options);

  if (typeof pathsOrFunc === "function") {
    bundlers[name] = pathsOrFunc(ss,options);
    bundlers[name].define(client, args[2], args[3], args[4], args[5]);
  } else {
    defaultBundler.define(client, args[1]);
  }
};

/**
 * Determine the bundler for a client
 * @param client Query params with client=name or an actual client object
 */
exports.get = function bundler(ss,client,options){

  if (client.bundler) return client.bundler;

  if (typeof client.client === "string") {
    return bundlers[client.client] || defaultBundler;
  }
  if (typeof client.name === "string") {
    return bundlers[client.name] || defaultBundler;
  }

  return defaultBundler;
};