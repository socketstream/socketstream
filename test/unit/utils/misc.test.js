/*jshint immed: false */

'use strict';

var path = require('path'),
    ac   = require('../../helpers/assertionCounter'),
    misc = require(path.join(process.env.PWD, 'lib/utils/misc'));

describe('lib/utils/misc', function () {

    describe('.parseWsMessage()', function () {

        // Used to reset the counters before each test
        beforeEach(ac.reset);

        it('should parse incomming message', function (done) {
            var message = "1|{id: 1, m: 'method.to.call', p: [param1, param2]}",
                paresedMessage;

            ac.expect(6);

            paresedMessage = misc.parseWsMessage(message);

            paresedMessage.should.be.an.instanceOf(Array).andCheck();
            paresedMessage.length.should.equal(2).andCheck();
            paresedMessage[0].should.have.type('string').andCheck();
            paresedMessage[1].should.have.type('string').andCheck();
            paresedMessage[0].should.equal( message.split('|')[0] ).andCheck();
            paresedMessage[1].should.equal( message.split('|')[1] ).andCheck();

            ac.check(done);
        });

        it('should trow an error if message is invalid', function (done) {
            var message = "1{id: 1, m: 'method.to.call', p: [param1, param2]}";

            ac.expect(0);

            (function() {
                misc.parseWsMessage(message);
            }).should.throw('Invalid message');

            ac.check(done);
        });
    });

    describe('.extend()', function () {

        // Used to reset the counters before each test
        beforeEach(ac.reset);

        it('should do nothing with a single argument', function (done) {
            var one = { a: 1, b: 2, c: 3 };

            ac.expect(3);

            misc.extend(one);

            one.a.should.equal(1).andCheck();
            one.b.should.equal(2).andCheck();
            one.c.should.equal(3).andCheck();

            ac.check(done);
        });

        it('should merge two objects', function (done) {
            var one = {a: 1, b: 2, c: 3},
                two = {b: 22};

            ac.expect(1);

            misc.extend(one, two);
            one.b.should.equal(22).andCheck();

            ac.check(done);
        });

        it('should merge three objects', function (done) {
            var one   = {a: 1, b: 2, c: 3},
                two   = {b: 22},
                three = {c: 33};

            ac.expect(2);

            misc.extend(one, two, three);
            one.b.should.equal(22).andCheck();
            one.c.should.equal(33).andCheck();

            ac.check(done);
        });

        it('should give priority to the last argument', function (done) {
            var one   = {a: 1, b: 2, c: 3},
                two   = {b: 22, c: 33},
                three = {c: 333};

            ac.expect(2);

            misc.extend(one, two, three);
            one.b.should.equal(22).andCheck();
            one.c.should.equal(333).andCheck();

            ac.check(done);

        });
    });

    describe('.defaults()', function () {

        // Used to reset the counters before each test
        beforeEach(ac.reset);

        it('should only be used for undeclared parameters', function (done) {
            var args    = {a: 1},
                newArgs = misc.defaults(args, {a: 11, b: 22, c: 33});

            ac.expect(3);

            newArgs.a.should.equal(1).andCheck();
            newArgs.b.should.equal(22).andCheck();
            newArgs.c.should.equal(33).andCheck();

            ac.check(done);

        });
    });
});