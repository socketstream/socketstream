fs = require('fs')
path = require('path')
fileUtils = require('../lib/utils/file')

should = require('should')
projectDir = 'test/testdata_project'
testDir = 'test/testdata_files'


describe 'isDir', ->

  it 'should return true for directories', ->
    fileUtils.isDir(projectDir).should.be.true
    fileUtils.isDir("#{projectDir}/client").should.be.true

  it 'should return false for non-directories', ->
    fileUtils.isDir("#{projectDir}/app.js").should.be.false
    fileUtils.isDir("#{projectDir}/client/views/main.jade").should.be.false


describe 'findExtForBasePath', ->

  it 'should return a matching file with an extension', ->
    basename = "#{projectDir}/client/views/main"
    fileUtils.findExtForBasePath(basename).should.equal ".jade"

  it 'should return the alpha-first matching file if there are multiple', ->
    basename = "#{testDir}/view"
    matchingFiles = fs.readdirSync(path.join basename, '..').filter (file) ->
      !!file.match new RegExp('^' + path.basename basename)

    matchingFiles.length.should.be.above 1
    fileUtils.findExtForBasePath(basename).should.equal ".html"

  it 'should return null for no matching files', ->
    basename = "#{projectDir}/client/views/justice"
    should.not.exist fileUtils.findExtForBasePath(basename)

  it 'should return null for files that do not exist', ->
    basename = "#{testDir}/i-dont-exist"
    should.not.exist fileUtils.findExtForBasePath(basename)
