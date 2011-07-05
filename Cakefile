task 'spec', 'run the test suite', (options) ->
  jasmine    = require 'jasmine-node'
  sys        = require 'sys'
  path       = require 'path'
  specFolder = path.join __dirname, 'spec'
  extensions = "js|coffee"
  isVerbose  = false
  showColors = true
  
  jasmine.loadHelpersInFolder specFolder, new RegExp("[-_]helper\\.(" + extensions + ")$")
  jasmine.executeSpecsInFolder(specFolder, ((runner, log) ->
    sys.print('\n')
    if (runner.results().failedCount == 0)
      process.exit(0)
    else
      process.exit(1)
  ), isVerbose, showColors, new RegExp(".spec\\.(" + extensions + ")$", 'i'))
  

  
