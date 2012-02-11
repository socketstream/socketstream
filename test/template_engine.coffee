fs = require('fs')

EngineLib = require('../lib/client_asset_manager/template_engine')
EngineStub = require('./testdata_stubs/template_engine')
defaultEngine = require('../lib/client_asset_manager/template_engines/default').init()

formatters =
  html: require('./testdata_stubs/formatter_html').init()
root = __dirname
dir = 'testdata_files'

testTmpl   = fs.readFileSync("#{root}/#{dir}/template.html")
testTmpl_2 = fs.readFileSync("#{root}/#{dir}/foo/template2.html")
testTmpl_3 = fs.readFileSync("#{root}/#{dir}/template.foo")


describe 'wrapTemplate', ->
  it 'should fallback on the default engine', ->
    lib = EngineLib.init()
    lib.generate root, dir, ['template.html'], formatters, (output) ->
      output.should.equal  defaultEngine.process(testTmpl, null, 'template')


  it 'should use a single specified engine', ->
    engine = EngineStub.init 'X'
    lib = EngineLib.init()
    lib.use(init: -> engine)
    lib.generate root, dir, ['template.html'], formatters, (output) ->
      output.should.equal  processWithWrap(engine, testTmpl, null, 'template')


  it 'should use a single specified engine and fallback when needed', ->
    engine = EngineStub.init 'X'

    lib = EngineLib.init()
    lib.use (init: -> engine), '/foo'
    lib.generate root, dir, ['foo/template2.html'], formatters, (output) ->
      output.should.equal  processWithWrap(engine, testTmpl_2, null, 'foo-template2')

    lib.generate root, dir, ['template.html'], formatters, (output) ->
      output.should.equal  defaultEngine.process(testTmpl, null, 'template')


  it 'should correctly wrap files', ->
    engine = EngineStub.init 'X'

    lib = EngineLib.init()
    lib.use (init: -> engine), '/foo'
    lib.generate root, dir, ['foo/template2.html', 'template.html'], formatters, (output) ->
      expected = processWithWrap(engine, testTmpl_2, null, 'foo-template2') +
                 defaultEngine.process(testTmpl, null, 'template')
      output.should.equal  expected

    # use another engine for root
    engine_2 = EngineStub.init 'Y'
    lib.use (init: -> engine_2), '/'
    lib.generate root, dir, ['foo/template2.html', 'template.html'], formatters, (output) ->
      expected = processWithWrap(engine, testTmpl_2, null, 'foo-template2') +
                 processWithWrap(engine_2, testTmpl, null, 'template')
      output.should.equal  expected


  it 'should not modify template content for unrecognized file extensions', ->
    lib = EngineLib.init()
    lib.generate root, dir, ['template.foo'], formatters, (output) ->
      output.should.equal  defaultEngine.process(testTmpl_3, null, 'template')



processWithWrap = (engine, tmpl, path, id) ->
  engine.prefix() +
  engine.process(tmpl, null, id) +
  engine.suffix()
