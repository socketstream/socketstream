'use strict';



describe('HTTP middleware', function () {


    describe('#set', function () {



        it('should allow the user to set options for the http middleware');



    });



    describe('#load', function () {



        it('should load SocketStream\'s middleware first');



        it('should then load any app-specific middleware next');



        it('should finally load the static asset serving middleware last');



    });



    describe('#route', function () {



        it('should if given a url and function, route requests for that url to that function');



        it('should if given just a url, return a serveClient function');



    });



});