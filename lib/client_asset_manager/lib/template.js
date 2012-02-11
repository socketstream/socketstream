var selectEngine;

exports.wrapTemplate = function(template, path, engine, prevEngine) {
  var output;
  output = [];
  if (prevEngine && prevEngine !== engine && prevEngine.suffix) {
    output.push(prevEngine.suffix());
  }
  if ((prevEngine === null || prevEngine !== engine) && engine.prefix) {
    output.push(engine.prefix());
  }
  prevEngine = engine;
  output.push(engine.process(template.toString(), path, exports.suggestedId(path)));
  return output.join('');
};

exports.selectEngine = function(engines, path) {
  return selectEngine(engines, path.split('/'));
};

selectEngine = function(templateEngines, pathAry) {
  var codePath, engine;
  pathAry.pop();
  codePath = '/' + pathAry.join('/');
  engine = templateEngines[codePath];
  if (engine === void 0 && pathAry.length > 0) {
    return selectEngine(templateEngines, pathAry);
  } else {
    return engine;
  }
};

exports.suggestedId = function(path) {
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) sp.pop();
  return sp.join('.').replace(/\//g, '-');
};
