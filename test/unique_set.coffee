UniqueSet = require('../lib/utils/unique_set').UniqueSet

describe 'Unqiue Set', ->

  it 'should add elements', ->
    set = new UniqueSet
    set.add('tom', 12345)
    set.add('tom', 12345)
    set.members('tom').toString().should.equal('12345')
    set.add('tom', null) # should NOT be added
    set.members('tom').toString().should.equal('12345')

  it 'should remove an element', ->
    set = new UniqueSet
    set.add('tom', 1111)
    set.add('tom', 1112)
    set.add('john', 2222)

    # Should remove correctly
    set.members('tom').join(',').should.equal('1111,1112')
    set.remove('tom', 1111)
    set.members('tom').join(',').should.equal('1112')
    set.remove('tom', 1112)

    # Should give an empty array back if no elements left
    (typeof(set.members('tom'))).should.equal('object')
    (set.members('tom').length).should.equal(0)

  it 'should list keys in a set', ->
    set = new UniqueSet
    set.add('tom', 1111)
    set.add('tom', 1112)
    set.add('john', 1113)
    set.add('paul', 1114)
    set.add(null, 1115) # should NOT be added
    set.keys().join(',').should.equal('tom,john,paul')

  it 'should remove a value across all keys', ->
    set = new UniqueSet
    set.add('channel1', 1111)
    set.add('channel1', 1112)
    set.add('channel2', 1112)
    set.add('channel3', 1111)
    set.add('channel4', 1114)
    set.add('channel5', 1111)
    # Confirm existance of 1111
    set.members('channel1').join(',').should.equal('1111,1112')
    set.members('channel3').join(',').should.equal('1111')
    set.members('channel5').join(',').should.equal('1111')
    # Remove 1111
    set.removeFromAll(1111)
    # Confirm removal
    set.members('channel1').join(',').should.equal('1112')
    set.members('channel3').join(',').should.equal('')
    set.members('channel5').join(',').should.equal('')

