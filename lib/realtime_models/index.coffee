# Realtime Models
# ---------------
# NOTE: All highly experimental and certain to change!

fs = require('fs')

exports.init = ->
  # See if we have any models to load
  try
    files = fs.readdirSync("#{$SS.root}/app/models").filter((file) -> !file.match(/(^_|^\.)/))
  catch e
    # Ignore if we don't have a models dir at the moment

  # Preload all model definitions
  if files and files.length > 0
    models = files.map((file) -> file.split('.')[0])
    models.forEach (model) ->
      model_name = model.split('/').pop()
      model_spec = require("#{$SS.root}/app/models/#{model_name}")[model_name]
      adapter = require("./adapters/#{model_spec.adapter}").init(model_name, model_spec)
      $SS.model[model_name] = adapter
