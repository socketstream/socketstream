"use strict";

var path = require('path'),
    UniqueSet = require( path.join(process.env.PWD, 'lib/utils/unique_set') ).UniqueSet,
    set;

exports['Unique Set'] = {
  setUp: function(done) {
    set = new UniqueSet;
    done();

  },
  'should add elements': function(test) {
    test.expect(2);

    set.add('tom', 12345);
    set.add('tom', 12345);
    test.strictEqual( set.members('tom').toString(), '12345' );

    set.add('tom', null);
    test.strictEqual( set.members('tom').toString(), '12345' );

    test.done();
  },

  'should remove an element': function(test) {
    test.expect(4);

    set.add('tom', 1111);
    set.add('tom', 1112);
    set.add('john', 2222);
    test.strictEqual( set.members('tom').join(','), '1111,1112' );

    set.remove('tom', 1111);
    test.strictEqual( set.members('tom').join(','), '1112' );

    set.remove('tom', 1112);
    test.strictEqual( typeof set.members('tom'), 'object' );
    test.strictEqual( set.members('tom').length, 0 );

    test.done();
  },

  'should list keys in a set': function(test) {
    test.expect(1);

    set.add('tom', 1111);
    set.add('tom', 1112);
    set.add('john', 1113);
    set.add('paul', 1114);
    set.add(null, 1115);

    test.strictEqual( set.keys().join(','), 'tom,john,paul' );

    test.done();
  },

  'should remove a value across all keys': function(test) {
    test.expect(6);

    set.add('channel1', 1111);
    set.add('channel1', 1112);
    set.add('channel2', 1112);
    set.add('channel3', 1111);
    set.add('channel4', 1114);
    set.add('channel5', 1111);
    test.strictEqual( set.members('channel1').join(','), '1111,1112' );
    test.strictEqual( set.members('channel3').join(','), '1111' );
    test.strictEqual( set.members('channel5').join(','), '1111' );

    set.removeFromAll(1111);
    test.strictEqual( set.members('channel1').join(','), '1112');
    test.strictEqual( set.members('channel3').join(','), '');
    test.strictEqual( set.members('channel5').join(','), '');

    test.done();
  }
}



