cli     = require '../../../lib/cli/cli.coffee'
fs      = require 'fs'
#request = require('request')
#exec    = require('child_process').exec

appName = 'tasty'
mode    = 0755

describe 'cli.coffee', ->
  
  beforeEach ->
    new cli.AppGenerator appName
  
  afterEach ->
    # remove files
    files = ['/app/client/app.coffee', '/app/css/app.styl', '/app/server/app.coffee', '/app/views/app.jade', '/app.coffee', '/lib/css/reset.css', '/lib/client/jquery-1.5.min.js']
    fs.unlinkSync appName + file, mode for file in files
    # then remove directories, in order of most nested
    directories = ['/app/client', '/app/css', '/app/server', '/app/views', '/app', '/lib/client', '/lib/css', '/lib/server', '/lib', '/public/assets', '/public', '/vendor']
    fs.rmdirSync appName + directory, mode for directory in directories
    fs.rmdirSync appName, mode
    
  it 'should generate a new application in the given directory', ->
    expect(fs.readdirSync appName).toEqual ['app','app.coffee','lib','public','vendor']
    expect(fs.readdirSync appName + '/app').toEqual ['client', 'css', 'server', 'views']
    expect(fs.readdirSync appName + '/lib').toEqual ['client', 'css', 'server']
    expect(fs.readdirSync appName + '/public').toEqual ['assets']
    # TODO check that other relevant files exist

  # getHomepage = (cb) ->
  #   request {uri:'http://localhost:3000/'}, (error, response, body) -> return cb(body)
          
  it 'should generate an application that will run fine right from the start', ->
    #
    # TODO - figure out a way to run the app, like an integration test
    #
    # pending
    # exec('node ' + appName + '/app.coffee')
    # expect(getHomepage()).toEqual('waa')
    # expect('waa').toEqual('waat')
        
      #return {error: error, response: response, body: body}
      #expect(response.statusCode).toEqual(200)
      #expect(error).toBeNull()
      
      # console.log body if !error && response.statusCode == 200
    # Generate a new application
    # it should run the app
    # it should check that it can visit the homepage and load the application fine.