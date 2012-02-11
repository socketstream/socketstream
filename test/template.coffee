require './testdata_helpers/function'

tlib = require('../lib/client_asset_manager/lib/template')
should = require('should')
tmplEngine = require('./testdata_stubs/template_engine')


describe 'wrapTemplate', ->
  it 'should write a prefix for a single engine', ->
    engine = tmplEngine.init('X')
    content = 'Hello'
    output = []
    output.push  tlib.wrapTemplate(content, 'one.html', engine, null)
    output.join('').should.equal "<X::prefix>[one::#{content}]"


  it 'should write the old engine prefix and the new engine prefix', ->
    engine_1 = tmplEngine.init('X')
    engine_2 = tmplEngine.init('Y')
    content = 'Hello'
    output = []

    output.push  tlib.wrapTemplate(content, 'one.html', engine_1, null)
    output.push  tlib.wrapTemplate(content, 'foo/two.html', engine_2, engine_1)
    output.join('').should.equal \
      "<X::prefix>[one::#{content}]<X::suffix><Y::prefix>[foo-two::#{content}]"



describe 'selectEngine', ->
  it 'should select the correct engine for a specific path', ->
    engines = generateEngineStubs(
      { name:'X', dirs:'/foo' }
      { name:'Y', dirs:'/bar' }
      { name:'Z', dirs:'/' }
    )
    select = tlib.selectEngine.curry(engines)
    select('foo/x.js').name.should.equal 'X'
    select('bar/y.js').name.should.equal 'Y'
    select('fizz/buzz/z.js').name.should.equal 'Z'


  it 'should work with subdirs', ->
    engines = generateEngineStubs(
      { name:'X', dirs:'/' }
      { name:'Y', dirs:'/bar' }
    )
    select = tlib.selectEngine.curry(engines)
    select('foo/sub/x.js').name.should.equal 'X'
    select('bar/sub/y.js').name.should.equal 'Y'


  it 'should default to the most specifid dir', ->
    engines = generateEngineStubs(
      { name:'X', dirs:'/foo' }
      { name:'Y', dirs:'/' }
    )
    select = tlib.selectEngine.curry(engines)

    select('foo/one.js').name.should.equal 'X'
    select('foo/bar/two.js').name.should.equal 'X'
    select('three.js').name.should.equal 'Y'
    select('sub/four.js').name.should.equal 'Y'


  it 'should work with nested subdirs', ->
    engines = generateEngineStubs(
      { name:'X', dirs:['/', '/foo/bar'] }
      { name:'Y', dirs:'/foo' }
      { name:'Z', dirs:'/foo/fizz' }
      { name:'L', dirs:'/foo/fizz/buzz' }
    )
    select = tlib.selectEngine.curry(engines)

    select('one.js').name.should.equal 'X'
    select('foo/two.js').name.should.equal 'Y'
    select('foo/bar/three.js').name.should.equal 'X'
    select('foo/fizz/four.js').name.should.equal 'Z'
    select('foo/fizz/buzz/five.js').name.should.equal 'L'


  it 'should return nothing for no matching engines', ->
    engines = generateEngineStubs name:'X', dirs:'/foo'
    select = tlib.selectEngine.curry(engines)

    select('foo/one.js').name.should.equal 'X'
    should.not.exist select('two.js')
    should.not.exist select('bar/three.js')



describe 'suggestedId', ->
  it 'should create an id based on file path', ->
    tlib.suggestedId('bar').should.equal 'bar'
    tlib.suggestedId('foo/bar').should.equal 'foo-bar'
    tlib.suggestedId('a/b/c').should.equal 'a-b-c'


  it 'should ignore only the last extension of the path', ->
    tlib.suggestedId('bar.js').should.equal 'bar'
    tlib.suggestedId('foo/bar.js').should.equal 'foo-bar'

    tlib.suggestedId('chocolate.bar.js').should.equal 'chocolate.bar'
    tlib.suggestedId('milk/chocolate.bar.js').should.equal 'milk-chocolate.bar'


generateEngineStubs = (specs...) ->
  engines = {}
  for {dirs,name} in specs
    dirs = [dirs] unless dirs instanceof Array
    engines[dir] = tmplEngine.init(name) for dir in dirs
  return engines
