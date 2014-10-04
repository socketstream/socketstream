'use strict';

var path      = require('path'),
    UniqueSet = require( path.join(process.env.PWD, 'lib/utils/unique_set') ).UniqueSet,
    set;

describe('lib/utils/unique_set', function () {

    beforeEach(function (done) {

        
        set = new UniqueSet;
        done();
    });

    it('should add elements', function (done) {

        set.add('tom', 12345);
        set.add('tom', 12345);
        set.members('tom').toString().should.equal('12345');

        set.add('tom', null);
        set.members('tom').toString().should.equal('12345');
        done();
    });

    it('should remove an element', function (done) {

        set.add('tom', 1111);
        set.add('tom', 1112);
        set.add('john', 2222);
        set.members('tom').join(',').should.equal('1111,1112');

        set.remove('tom', 1111);
        set.members('tom').join(',').should.equal('1112');

        set.remove('tom', 1112);
        set.members('tom').should.be.type('object');
        set.members('tom').length.should.equal(0);

        done();
    });

    it('should list keys in a set', function (done) {

        set.add('tom', 1111);
        set.add('tom', 1112);
        set.add('john', 1113);
        set.add('paul', 1114);
        set.add(null, 1115);

        set.keys().join(',').should.equal('tom,john,paul');

        done();
    });

    it('should remove a value across all keys', function (done) {

        set.add('channel1', 1111);
        set.add('channel1', 1112);
        set.add('channel2', 1112);
        set.add('channel3', 1111);
        set.add('channel4', 1114);
        set.add('channel5', 1111);
        set.members('channel1').join(',').should.equal('1111,1112');
        set.members('channel3').join(',').should.equal('1111');
        set.members('channel5').join(',').should.equal('1111');

        set.removeFromAll(1111);
        set.members('channel1').join(',').should.equal('1112');
        set.members('channel3').join(',').should.equal('');
        set.members('channel5').join(',').should.equal('');

        done();
    });
});