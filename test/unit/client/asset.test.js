'use strict';



describe('client asset handler', function () {



    describe('#js', function () {



        it('should return the compressed file, if the compress option is true');



        it('should otherwise return the file');



        it('should not modify the code, if it\'s in the libs directory');



        it('should not add a leading slash to the path, if the file is a system module');



        it('should otherwise wrap the file in a module wrapper');



        it('should raise an error if the file is not found at the path');



        it('should raise an error if the file is not supported');



        it('should raise an error if the file is not the right type');



    });



    describe('#worker', function () {



        it('should return the compressed file, if the compress option is true');



        it('should otherwise return the file');



        it('should raise an error if the file is not found at the path');



        it('should raise an error if the file is not supported');



        it('should raise an error if the file is not the right type');



    });



    describe('#css', function () {



       it('should raise an error if the file is not found at the path');



        it('should raise an error if the file is not supported');



        it('should raise an error if the file is not the right type');



    });



    describe('#html', function () {



       it('should raise an error if the file is not found at the path');



        it('should raise an error if the file is not supported');



        it('should raise an error if the file is not the right type');



    });



});