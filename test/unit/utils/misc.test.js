"use strict";

var path = require('path'),
    misc = require(path.join(process.env.PWD, 'lib/utils/misc'));

exports.Extend ={
    'should do nothing with a single argument': function(test) {
      var one = { a: 1, b: 2, c: 3 };

      misc.extend(one);

      test.expect(3);
      test.strictEqual( one.a, 1 );
      test.strictEqual( one.b, 2 );
      test.strictEqual( one.c, 3 );

      test.done();
    },

    'should merge two objects': function(test) {
      var one = {a: 1, b: 2, c: 3},
          two = {b: 22};

      misc.extend(one, two);

      test.expect(1);
      test.strictEqual( one.b, 22 );

      test.done();
    },

    'should merge three objects': function(test) {
      var one   = {a: 1, b: 2, c: 3},
          two   = {b: 22},
          three = {c: 33};

      misc.extend(one, two, three);

      test.expect(2);
      test.strictEqual( one.b, 22 );
      test.strictEqual( one.c, 33 );

      test.done();
    },

    'should give priority to the last argument': function(test) {
      var one   = {a: 1, b: 2, c: 3},
          two   = {b: 22, c: 33},
          three = {c: 333};

      misc.extend(one, two, three);

      test.expect(2);
      test.strictEqual( one.b, 22 );
      test.strictEqual( one.c, 333 );

      test.done();
    }
}


exports.Defaults = {
  'should only be used for undeclared parameters': function(test) {
    var args    = {a: 1},
        newArgs = misc.defaults(args, {a: 11, b: 22, c: 33});

    test.expect(3);
    test.strictEqual( newArgs.a, 1 );
    test.strictEqual( newArgs.b, 22 );
    test.strictEqual( newArgs.c, 33 );

    test.done();
  }
}
