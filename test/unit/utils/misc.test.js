/*jshint immed: false */

'use strict';

var path = require('path'),
    misc = require(path.join('../../..', 'lib/utils/misc'));

describe('lib/utils/misc', function () {

    describe('.parseWsMessage()', function () {

        it('should parse incomming message', function (done) {
            var message = "1|{id: 1, m: 'method.to.call', p: [param1, param2]}",
                paresedMessage;

            paresedMessage = misc.parseWsMessage(message);

            paresedMessage.should.be.an.instanceOf(Array);
            paresedMessage.length.should.equal(2);
            paresedMessage[0].should.have.type('string');
            paresedMessage[1].should.have.type('string');
            paresedMessage[0].should.equal( message.split('|')[0] );
            paresedMessage[1].should.equal( message.split('|')[1] );

            done();
        });

        it('should trow an error if message is invalid', function (done) {
            var message = "1{id: 1, m: 'method.to.call', p: [param1, param2]}";

            (function() {
                misc.parseWsMessage(message);
            }).should.throw('Invalid message');

            done();
        });
    });

    describe('.extend()', function () {

        it('should do nothing with a single argument', function (done) {
            var one = { a: 1, b: 2, c: 3 };

            misc.extend(one);

            one.a.should.equal(1);
            one.b.should.equal(2);
            one.c.should.equal(3);

            done();
        });

        it('should merge two objects', function (done) {
            var one = {a: 1, b: 2, c: 3},
                two = {b: 22};

            misc.extend(one, two);
            one.b.should.equal(22);

            done();
        });

        it('should merge three objects', function (done) {
            var one   = {a: 1, b: 2, c: 3},
                two   = {b: 22},
                three = {c: 33};

            misc.extend(one, two, three);
            one.b.should.equal(22);
            one.c.should.equal(33);

            done();
        });

        it('should give priority to the last argument', function (done) {
            var one   = {a: 1, b: 2, c: 3},
                two   = {b: 22, c: 33},
                three = {c: 333};

            misc.extend(one, two, three);
            one.b.should.equal(22);
            one.c.should.equal(333);

            done();

        });
    });

    describe('.defaults()', function () {

        it('should only be used for undeclared parameters', function (done) {
            var args    = {a: 1},
                newArgs = misc.defaults(args, {a: 11, b: 22, c: 33});

            newArgs.a.should.equal(1);
            newArgs.b.should.equal(22);
            newArgs.c.should.equal(33);

            done();

        });
    });
});
