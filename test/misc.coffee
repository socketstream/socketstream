misc = require('../lib/utils/misc')

describe 'Extend', ->

  it 'should do nothing with a single argument', ->
    one = a:1, b:2, c:3
    misc.extend(one)
    one.a.should.equal 1
    one.b.should.equal 2
    one.c.should.equal 3

  it 'should merge two objects', ->
    one = a:1, b:2, c:3
    two = b:22
    misc.extend(one, two)
    one.b.should.equal 22

  it 'should merge three objects', ->
    one = a:1, b:2, c:3
    two = b:22
    three = c:33
    misc.extend(one, two, three)
    one.b.should.equal 22
    one.c.should.equal 33

  it 'should give priority to the last argument', ->
    one = a:1, b:2, c:3
    two = b:22, c:33
    three = c:333
    misc.extend(one, two, three)
    one.b.should.equal 22
    one.c.should.equal 333


describe 'Defaults', ->

  it 'should only be used for undeclared parameters', ->
    args = a:1
    newArgs = misc.defaults args,
      a: 11
      b: 22
      c: 33
    newArgs.a.should.equal 1
    newArgs.b.should.equal 22
    newArgs.c.should.equal 33
