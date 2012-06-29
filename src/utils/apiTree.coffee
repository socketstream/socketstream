pathlib = require('path')
apiTree = require('apitree')

exports.loadApiTree = (dir) ->

  allowedExtensions = (k for k,v of require.extensions when k != '.json')
    
  apiTree.createApiTree(dir, filter: (name, names) ->
    ext = pathlib.extname(name)
    return ext == '.js' or (ext in allowedExtensions and not (pathlib.basename(name, ext).concat('.js') in names))
  )
