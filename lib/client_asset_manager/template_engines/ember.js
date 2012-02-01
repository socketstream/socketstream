
exports.init = function(root, config) {
  return {
    name: 'Ember.js',
    process: function(template, path, id) {
      return '<script type="text/x-handlebars" data-template-name="' + id + '">' + template + '</script>';
    }
  };
};
