# Realtime Models
# ---------------
# NOTE: All highly experimental and certain to change!

fs = require('fs')

exports.rest = require('./rest.coffee')

exports.init = ->
  loadModels()

exports.broadcast = (msg) ->
  $SS.publish.broadcast('rtm', msg)

loadModels = ->
  # See if we have any models to load
  files = try
    fs.readdirSync("#{$SS.root}/app/models").filter((file) -> !file.match(/(^_|^\.)/))
  catch e
    []
  # Preload all model definitions
  if files.length > 0
    models = files.map((file) -> file.split('.')[0])
    models.forEach (model) ->
      model_name = model.split('/').pop()
      model_spec = require("#{$SS.root}/app/models/#{model_name}")[model_name]
      $SS.model[model_name] = require("./adapters/#{model_spec.adapter}").init(model_name, model_spec, exports)
      Object.defineProperty($SS.model[model_name], '_rtm', {value: model_spec, enumerable: false})

