// Produces templates for Ember.js
// Note Ember compiles these Handlebars templates one time only when you call Em.Application.create();

exports.init = function(root, config) {
  return {
    name: 'Ember.js',
    process: function(template, path, id) {
      return '<script type="text/x-handlebars" data-template-name="' + id + '">' + template + '</script>';
    }
  };
};
