"use strict";

var path = require('path'),
    misc = require(path.join(process.env.PWD, 'lib/utils/misc'));

describe('Extend', function() {

  it('should do nothing with a single argument', function() {
    var one = { a: 1, b: 2, c: 3 };

    misc.extend(one);
    one.a.should.equal(1);
    one.b.should.equal(2);
    one.c.should.equal(3);
  });

  it('should merge two objects', function() {
    var one = {a: 1, b: 2, c: 3},
        two = {b: 22};

    misc.extend(one, two);
    one.b.should.equal(22);
  });

  it('should merge three objects', function() {
    var one   = {a: 1, b: 2, c: 3},
        two   = {b: 22},
        three = {c: 33};

    misc.extend(one, two, three);
    one.b.should.equal(22);
    one.c.should.equal(33);
  });

  it('should give priority to the last argument', function() {
    var one   = {a: 1, b: 2, c: 3},
        two   = {b: 22, c: 33},
        three = {c: 333};

    misc.extend(one, two, three);
    one.b.should.equal(22);
    one.c.should.equal(333);
  });
});

describe('Defaults', function() {
  it('should only be used for undeclared parameters', function() {
    var args    = {a: 1},
        newArgs = misc.defaults(args, {a: 11, b: 22, c: 33});

    newArgs.a.should.equal(1);
    newArgs.b.should.equal(22);
    newArgs.c.should.equal(33);
  });
});
