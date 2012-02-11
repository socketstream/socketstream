# Template
# ----------
# This is a collection of methods that are related to manipulating
# template engines.


exports.wrapTemplate = (template, path, engine, prevEngine) ->
  output = []

  # If the template type has changed since the last template, include any closing suffix from the last engine used (if present)
  output.push(prevEngine.suffix()) if prevEngine && prevEngine != engine && prevEngine.suffix

  # If this is the first template of this type and it has prefix, include it here
  output.push(engine.prefix()) if (prevEngine == null || prevEngine != engine) && engine.prefix

  # Add main template output and return
  prevEngine = engine
  output.push engine.process(template.toString(), path, exports.suggestedId(path))
  output.join('')

exports.selectEngine = (engines, path) -> selectEngine engines, path.split('/')

selectEngine = (templateEngines, pathAry) ->
  pathAry.pop() # remove file name
  codePath = '/' + pathAry.join('/')
  engine = templateEngines[codePath]
  if engine == undefined and pathAry.length > 0
    selectEngine(templateEngines, pathAry)
  else
    engine

# Suggest an ID for this template based upon its path
# 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
exports.suggestedId = (path) ->
  sp = path.split('.')
  sp.pop() if path.indexOf('.') > 0
  sp.join('.').replace(/\//g, '-')
