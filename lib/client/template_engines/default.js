// Default Engine produces standard <script> tags which can be used with jQuery Templates and uncompiled
// Hogan/Mustache templates among many others.
// Note all templates are prefixed with 'tmpl-' to prevent conflicts with DOM IDs in your application

exports.init = function(root, config) {
  return {
    name: 'Default',
    process: function(template, path, id) {
      return '<script id="tmpl-' + id + '" type="text/x-tmpl">' + template + '</script>';
    }
  };
};
