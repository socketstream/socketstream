'use strict';



describe('client asset manager index', function () {



    describe('#formatters', function () {



        it('should return the code formatters API');



    });



    describe('#templateEngine', function () {



        it('should return the templateEngine API');



    });



    describe('#systemAssets', function () {



        it('should return the system assets API');



    });



    describe('#options', function () {



        it('should return an object specifying the app\'s options');



    });



    describe('#set', function () {



        it('should allow the user to overwrite the existing options');



    });



    describe('#packAssets', function () {



        it('should tell the asset manager to pack and minimise all assets');



    });



    describe('#define', function () {



        it('should return a client object containing a name, and the paths of all the files it has');



        it('should throw an error if the name has already been used');



        it('should throw an error if more than one HTML view is defined');



        it('should throw an error if the html view is not a valid html template');



    });



    describe('#load', function () {



        it('should listen for incoming asset requests');



        it('should load existing pre-packed assets, if they exist');



        it('should re-pack assets in case they do not exist');



        it('should otherwise serve files directly, and watch for changes to those files');



        it('should also listen out for request to asynchronously load new assets');



    });



});