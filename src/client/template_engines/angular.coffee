# Produces inline templates for Angular.js
# Use them in conjunction with `ng-view`. Note the `.html` at the end of each template name which is automatically appended

exports.init = (root, config) ->

  name: 'Angular.js'

  process: (template, path, id) ->
    '<script type="text/ng-template" id="' + id + '.html">' + template + '</script>'