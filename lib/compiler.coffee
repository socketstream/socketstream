# Compiles assets either live for Server (in when developing) or for Packer
# Compiles according to the file extensions

class exports.Compiler
  
  respondsToUrl: (url) ->
    #return true if url == '/'
    responds_to = ['coffee', 'styl']
    file_extension = url.split('.').reverse()[0]
    responds_to.include(file_extension)
  
  fromURL: (url, cb) ->
    return @jade('app.jade',cb) if url == '/'
    file_name = url.split('/')[2]
    file_extension = url.split('.').reverse()[0]
    @[file_extension](file_name, cb)


  jade: (input_file_name, locals, cb) ->
    file = "#{$SS.root}/app/views/#{input_file_name}"
    $SS.libs.jade.renderFile file, {locals: {SocketStream: locals}}, (err, html) ->
      cb {output: html, content_type: 'text/html'}

  coffee: (input_file_name, cb) ->
    input = fs.readFileSync "#{$SS.root}/app/client/#{input_file_name}", 'utf8'
    try
      js = $SS.libs.coffee.compile(input)
      cb {output: js, content_type: 'text/javascript'}
    catch e
      sys.log("\x1B[1;31mError: Unable to compile Coffeescript file #{input_file_name} to JS\x1B[0m")
      throw(e) if $SS.config.throw_errors
      
  styl: (input_file_name, cb)  ->
    source_path = "#{$SS.root}/app/css"
    input = fs.readFileSync "#{source_path}/#{input_file_name}", 'utf8'
    $SS.libs.stylus.render input, { filename: input_file_name, paths: [source_path], compress: $SS.config.pack_assets}, (err, css) ->
      if err
        sys.log("\x1B[1;31mError: Unable to compile Stylus file #{input_file_name} to CSS\x1B[0m")
        throw(err)
      cb {output: css, content_type: 'text/css'}
