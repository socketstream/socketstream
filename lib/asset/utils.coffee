# Assets Util Helpers

fs = require("fs")
util = require("util")

exports.fileList = (path, first_file = null) ->
  try
    files = fs.readdirSync(path).filter((file) -> !file.match(/(^_|^\.)/)).sort()
    if first_file and files.include(first_file)
      files = files.delete(first_file)
      files.unshift(first_file) 
    files
  catch e
    throw e unless e.code == 'ENOENT' # dir missing
    []

exports.concatFiles = (path) ->
  files = @fileList path
  files.map (file_name) ->
    util.log "  Concatenating file #{file_name}"
    output = fs.readFileSync("#{path}/#{file_name}", 'utf8')
    output = exports.minifyJS(file_name, output) if file_name.match(/\.(coffee|js)/) and !file_name.match(/\.min/)
    output += ';' if file_name.match(/\.(js)/) # Ensures the file ends with a semicolon. Many libs don't and would otherwise break when concatenated
    output
  .join("\n")

exports.minifyJS = (file_name, orig_code) ->
  formatKb = (size) -> "#{Math.round(size * 1000) / 1000} KB"
  orig_size = (orig_code.length / 1024)
  jsp = $SS.libs.uglifyjs.parser
  pro = $SS.libs.uglifyjs.uglify
  ast = jsp.parse(orig_code)
  ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  minified = pro.gen_code(ast)
  min_size = (minified.length / 1024)
  util.log("  Minified #{file_name} from #{formatKb(orig_size)} to #{formatKb(min_size)}")
  minified
