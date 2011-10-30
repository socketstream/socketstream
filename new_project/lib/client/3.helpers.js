// Helpers
// -------
// These prototype helpers affect ALL your client-side and shared code. They also exist server-side, so you can use them anywhere.
// It is possible these helpers may conflict with an external third party library. Feel free to edit or delete this file if you don't want to use them.
// You will always be able to obtain the latest version of this file by coping/merging it in from a new project.
// Thanks to Addy Osmani for writing these and providing tests at https://github.com/addyosmani/socketstream-helpers

/**
	.bind() support
**/

if ( !Function.prototype.bind ) {
  Function.prototype.bind = function( obj ) {
    var slice = [].slice,
        args = slice.call(arguments, 1),
        self = this,
        nop = function () {},
        bound = function () {
          return self.apply( this instanceof nop ? this : ( obj || {} ),
                              args.concat( slice.call(arguments) ) );
        };

    nop.prototype = self.prototype;
    bound.prototype = new nop();

    return bound;
  };
}

/**
	Removes any duplicate entries from the current array
**/
if ( !String.prototype.unique ) {
	String.prototype.unique = function(b){
		 var a = "", i, l = this.length,q="";
		 for( i=0; i<l; i++ ) {
		  if( a.indexOf( this[i], 0, b ) < 0 ) {
			a += this[i];
			}
		 }
		return a;
	};
}

/**
	Removes any duplicate entries from the current string
**/
if ( !Array.prototype.unique ) {
	Array.prototype.unique = function( b ) {
		 var a = [], i, l = this.length;
		 for( i=0; i<l; i++ ) {
		  if( a.indexOf( this[i], 0, b ) < 0 ) { a.push( this[i] ); }
		 }
		return a;
	};
}

/**
	Returns the last character in the current string
**/
if ( !String.prototype.last ) {
	String.prototype.last = function(){
		return this[this.length-1];
	};
}

/**
	Returns the last element in the current array
**/
if ( !Array.prototype.last ) {
	Array.prototype.last = function(){
		return this[this.length-1];
	};
}

/**
	Truncates the current string to the supplied length
**/
if ( !String.prototype.truncate ) {
	String.prototype.truncate = function(length){
		if (this.length > length) {
		    return this.slice(0, length - 3) + "...";
		}else {
			return this;
		}
	};
}

/**
	Truncates the current array to the supplied length
**/
if ( !Array.prototype.truncate ) {
	Array.prototype.truncate = function(length){
		return this.slice(0, length);
	}
}

/**
	Returns a random character from the current string
**/
if ( !String.prototype.random ) {
	String.prototype.random = function( r ) {
		 var i = 0, l = this.length;
		 if( !r ) { r = this.length; }
		 else if( r > 0 ) { r = r % l; }
		 else { i = r; r = l + r % l; }
		 return this[ Math.floor( r * Math.random() - i ) ];
	};
}

/**
	Returns a random element from the current array
**/
if ( !Array.prototype.random ) {
	Array.prototype.random = function( r ) {
		 var i = 0, l = this.length;
		 if( !r ) { r = this.length; }
		 else if( r > 0 ) { r = r % l; }
		 else { i = r; r = l + r % l; }
		 return this[ Math.floor( r * Math.random() - i ) ];
	};
}

/**
	Boolean check to find out if a supplied character is in the current string
**/

if ( !String.prototype.include ) {
	String.prototype.include = function(value) {
	    var i = this.length;
	    while (i--) {
	        if (this[i] === value) return true;
	    }
	    return false;
	};
}

/**
	Boolean check to find out if a supplied element/string is in the current array
**/
if ( !Array.prototype.include ) {
	Array.prototype.include = function(value) {
	    var i = this.length;
	    while (i--) {
	        if (this[i] === value) return true;
	    }
	    return false;
	};
}

/**
	Boolean check to find out if a supplied character is in the current string
**/

if ( !String.prototype.contains ) {
	String.prototype.contains = String.prototype.include;
}

/**
	Boolean check to find out if a supplied character is in the current array
**/

if ( !Array.prototype.contains ) {
	Array.prototype.contains = Array.prototype.include;
}

/**
	Boolean check to find out if an array contains any elements
**/
if ( !Array.prototype.any ) {
	Array.prototype.any = function(){
		return !(this && this.constructor==Array && this.length==0);
	};
}

/**
	Sanitize content containing URLs or mailto/email references
**/
if ( !String.prototype.sanitize ) {
	String.prototype.sanitize = function(){
		return this.replace(/(([fh]+t+p+s?\:\/)+([^"'\s]+))/gi,"<a href=\"$1\" target=\"_blank\">$1<\/a>").
		  replace(/([a-z0-9\-\.]+\@[a-z0-9\-]+([^"'\s]+))/gi,"<a href=\"mailto:$1\" target=\"_blank\">$1<\/a>");
	};
}