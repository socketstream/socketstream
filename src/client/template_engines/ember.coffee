# Produces templates for Ember.js
# Note Ember compiles these Handlebars templates one time only when you call Em.Application.create();

exports.init = (root, config) ->

  name: 'Ember.js'

  process: (template, path, id) ->
    '<script type="text/x-handlebars" data-template-name="' + id + '">' + template + '</script>'