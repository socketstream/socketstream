coffee = require('coffee-script')
fs = require('fs')
pathlib = require('path')
loadApiTree = require('../lib/utils/apiTree').loadApiTree


should = require('should')
testDir = pathlib.join(__dirname, 'testdata_api')

describe 'loadApiTree defaults', ->

  api = {}

  beforeEach ->
    api = loadApiTree(testDir)

  it 'should load .js modules', ->
    api.should.have.property('test')
    api.should.have.property('demo')
    api.should.have.property('comp')

  it 'should load .coffee modules with no matching .js file', ->
    api.should.have.property('beans')

  it 'should load .js version not .coffee version of file', ->
    api.test.actions.should.be.an.instanceOf(Function)

  it 'should not load non- .js or .coffee extensions', ->
    api.should.not.have.property('calc')
    api.should.not.have.property('data')
    api.should.not.have.property('readme')

describe 'loadApiTree add an extension', ->

  api = {}

  beforeEach ->
    require.extensions['.ls'] = (module, filename) ->
        # Just load with coffee compiler - to avoid uncesary dependencies
        content = coffee.compile(fs.readFileSync(filename, 'utf8'), {bare: true})
        module._compile(content, filename)

    api = loadApiTree(testDir)

  afterEach ->
    delete require.extensions['.ls']

  it 'should load .ls modules with no matching .js file', ->
    api.should.have.property('calc')

  it 'should load .js version not .ls version of file', ->
    api.comp.actions.should.be.an.instanceOf(Function)

  it 'should not load non- .js or .coffee extensions', ->
    api.should.not.have.property('cold')
    api.should.not.have.property('data')
    api.should.not.have.property('readme')
