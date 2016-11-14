'use strict';

var fs = require('fs-extra'),
    path = require('path');

exports.project = path.join(__dirname, 'project');
exports.files = path.join(__dirname, 'files');
exports.readDirSync = path.join(__dirname, 'readDirSync');

exports.setProject = function(name) {

  var ss = require('../../lib/socketstream');
  ss.root = ss.api.root = path.join(__dirname, name);
};

exports.reset = function(done) {
  // generated abc client assets
  fs.emptyDir(path.join(__dirname,'project/client/static/assets/abc'),function() {
    if (done) {
      done();
    }
  });
};

exports.cleanup = function(done) {
  fs.emptyDir(path.join(__dirname, 'project','client','static','assets'), done);
};

exports.setAbcPreviousAbcAssets = function() {
  var id = '1234567890';
  fs.closeSync(fs.openSync(path.join(__dirname,'project/client/static/assets/abc',id+'.css'),'w'));
  fs.closeSync(fs.openSync(path.join(__dirname,'project/client/static/assets/abc',id+'.js'),'w'));
  fs.closeSync(fs.openSync(path.join(__dirname,'project/client/static/assets/abc',id+'.html'),'w'));
};

var os = require('os'), EOL = os.EOL;
exports.expected_css = '/* style.css */' + EOL + 'body {color:red;}' + EOL;
exports.expected_css_packed = 'body{color:red;}' + EOL;
exports.expected_html_packed = fs.readFileSync(path.join(__dirname,'project/client/abc/expected.html'),'utf-8');
exports.expected_js_packed = fs.readFileSync(path.join(__dirname,'project/client/abc/expected.min.js'),'utf-8');
