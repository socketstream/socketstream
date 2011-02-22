# Realtime Models
# ---------------
# NOTE: All highly experimental and certain to change!

exports.init = ->
  
  # Add function to load new models
  $SS.model = (path) ->
    require("#{$SS.root}/app/models/#{path}").model
