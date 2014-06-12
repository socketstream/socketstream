'use strict';



describe('production mode asset server', function () {



    it('should provide a route for serving javascript code');



    it('should provide a route for serving web worker requests');



    it('should serve requests from a cache, rather than reading a file');



    it('should populate the cache for a request, if that request hasn\'t been processed before');



    it('should compress the file, if specified in the packAssets options');



    it('should raise an error if the file is referenced, but missing');



});