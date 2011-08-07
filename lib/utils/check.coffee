# Checks

# Ensures you don't have a module and a folder of the same name (otherwise we can't map it to an object)
exports.forNameConflicts = (trees) ->
  trees.forEach (tree) ->
    if tree
      files_without_exts = tree.files.map (file) ->
        file.split('.')[0]
      tree.dirs.forEach (dir) ->
        files_without_exts.forEach (file) ->
          if file == dir
            fatal "Unable to load the #{dir} directory\nIt conflicts with a file of the same name in the parent directory. Please rename one of them."