# Compiles assets either live for Server (in when developing) or for Packer
# Compiles according to the file extensions

class exports.Compiler
  
  fromURL: (url, cb) ->
    file_name = url.split('/')[2].split('.')[0]
    file_extension = url.split('.').reverse()[0]
    @[file_extension](file_name, cb)


  coffee: (input_file_name, cb) ->
    fs.readFile "#{$SS.root}/app/client/#{input_file_name}.coffee", 'utf8', (err, input) ->
      js = $SS.libs.coffee.compile(input)
      cb {output: js, content_type: 'text/javascript'}
    
  styl: (input_file_name, cb)  ->
    source_path = "#{$SS.root}/app/css"
    source_file = "#{input_file_name}.styl"
    fs.readFile "#{source_path}/#{source_file}", 'utf8', (err, input) ->
      $SS.libs.stylus.render input, { filename: source_file, paths: [source_path], compress: $SS.config.pack_assets}, (err, css) ->
        if err
          console.log "Error in: #{source_file}"
          throw(err)
        cb {output: css, content_type: 'text/css'}
