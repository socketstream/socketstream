'use strict';



/* Dependencies */

var ac            = require('../helpers/assertionCounter');



describe('lib/socketstream', function () {



    beforeEach(function (done) {

        ac.reset();
        done();

    });



    describe('exports.env', function () {



        it('should inherit the Node environment variable from NODE_ENV, if passed');



        it('should inherit the Node environment variable from SS_ENV, if passed');



        it('should default to development, if neither NODE_ENV or SS_ENV are passed');



    });



});