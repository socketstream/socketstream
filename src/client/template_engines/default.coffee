# Default Engine produces standard <script> tags which can be used with jQuery Templates and uncompiled
# Hogan/Mustache templates among many others.
# Note all templates are prefixed with 'tmpl-' to prevent conflicts with DOM IDs in your application

exports.init = (root, config) ->

  name: 'Default'

  process: (template, path, id) ->
    '<script id="tmpl-' + id + '" type="text/x-tmpl">' + template + '</script>'