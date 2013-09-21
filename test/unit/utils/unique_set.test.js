'use strict';



// Dependencies
//
var path        = require('path'),
    ac          = require('../../helpers/assertionCounter'),
    UniqueSet   = require( path.join(process.env.PWD, 'lib/utils/unique_set') ).UniqueSet,
    set;



describe('Unique Set', function () {



    beforeEach(function (done) {

        ac.reset();
        set = new UniqueSet;
        done();

    });



    it('should add elements', function (done) {

        ac.expect(2);

        set.add('tom', 12345);
        set.add('tom', 12345);
        set.members('tom').toString().should.equal('12345').andCheck();

        set.add('tom', null);
        set.members('tom').toString().should.equal('12345').andCheck();
        ac.check(done);

    });



    it('should remove an element', function (done) {

        ac.expect(4);

        set.add('tom', 1111);
        set.add('tom', 1112);
        set.add('john', 2222);
        set.members('tom').join(',').should.equal('1111,1112').andCheck();

        set.remove('tom', 1111);
        set.members('tom').join(',').should.equal('1112').andCheck();

        set.remove('tom', 1112);
        (typeof set.members('tom')).should.equal('object').andCheck();
        set.members('tom').length.should.equal(0).andCheck();

        ac.check(done);

    });



    it('should list keys in a set', function (done) {

        ac.expect(1);

        set.add('tom', 1111);
        set.add('tom', 1112);
        set.add('john', 1113);
        set.add('paul', 1114);
        set.add(null, 1115);

        set.keys().join(',').should.equal('tom,john,paul').andCheck();

        ac.check(done);

    });



    it('should remove a value across all keys', function (done) {

        ac.expect(6);

        set.add('channel1', 1111);
        set.add('channel1', 1112);
        set.add('channel2', 1112);
        set.add('channel3', 1111);
        set.add('channel4', 1114);
        set.add('channel5', 1111);
        set.members('channel1').join(',').should.equal('1111,1112').andCheck();
        set.members('channel3').join(',').should.equal('1111').andCheck();
        set.members('channel5').join(',').should.equal('1111').andCheck();

        set.removeFromAll(1111);
        set.members('channel1').join(',').should.equal('1112').andCheck();
        set.members('channel3').join(',').should.equal('').andCheck();
        set.members('channel5').join(',').should.equal('').andCheck();

        ac.check(done);

    });

});