'use strict';



// Dependencies
//
var path                = require('path'),
    ac                  = require('../../helpers/assertionCounter'),
    misc                = require(path.join(process.env.PWD, 'lib/utils/misc'));



describe('Extend', function () {



    // Used to reset the counters before each test
    //
    beforeEach(ac.reset);



    it('should do nothing with a single argument', function (done) {

        ac.expect(3);

        var one = { a: 1, b: 2, c: 3 };

        misc.extend(one);

        one.a.should.equal(1).andCheck();
        one.b.should.equal(2).andCheck();
        one.c.should.equal(3).andCheck();

        ac.check(done);

    });



    it('should merge two objects', function (done) {

        ac.expect(1);

        var one = {a: 1, b: 2, c: 3},
            two = {b: 22};

        misc.extend(one, two);
        one.b.should.equal(22).andCheck();

        ac.check(done);

    });



    it('should merge three objects', function (done) {

        ac.expect(2);

        var one   = {a: 1, b: 2, c: 3},
            two   = {b: 22},
            three = {c: 33};

        misc.extend(one, two, three);
        one.b.should.equal(22).andCheck();
        one.c.should.equal(33).andCheck();

        ac.check(done);

    });



    it('should give priority to the last argument', function (done) {

        ac.expect(2);

        var one   = {a: 1, b: 2, c: 3},
            two   = {b: 22, c: 33},
            three = {c: 333};

        misc.extend(one, two, three);
        one.b.should.equal(22).andCheck();
        one.c.should.equal(333).andCheck();

        ac.check(done);

    });



});



describe('Defaults', function () {



    // Used to reset the counters before each test
    //
    beforeEach(ac.reset);



    it('should only be used for undeclared parameters', function (done) {

        ac.expect(3);


        var args    = {a: 1},
            newArgs = misc.defaults(args, {a: 11, b: 22, c: 33});

        newArgs.a.should.equal(1).andCheck();
        newArgs.b.should.equal(22).andCheck();
        newArgs.c.should.equal(33).andCheck();

        ac.check(done);

    });



});