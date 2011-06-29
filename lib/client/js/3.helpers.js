// These extensions affect ALL client side objects. Be very careful about introducing new ones as they may break existing client-side libraries

/**
	Removes any duplicate entries from the current array
**/
String.prototype.unique = function(b){
	 var a = "", i, l = this.length,q="";
	 for( i=0; i<l; i++ ) {
	  if( a.indexOf( this[i], 0, b ) < 0 ) { 
		a += this[i];
		}
	 }
	return a;
};

/**
	Removes any duplicate entries from the current string
**/
Array.prototype.unique = function( b ) {
	 var a = [], i, l = this.length;
	 for( i=0; i<l; i++ ) {
	  if( a.indexOf( this[i], 0, b ) < 0 ) { a.push( this[i] ); }
	 }
	return a;
};

/**
	Returns the last character in the current string
**/
String.prototype.last = function(){
	return this[this.length-1];
};

/**
	Returns the last element in the current array
**/
Array.prototype.last = function(){
	return this[this.length-1];
};

/**
	Truncates the current string to the supplied length
**/
String.prototype.truncate = function(length){	
	if (this.length > length) {
	    return this.slice(0, length - 3) + "...";
	}else {
		return this;
	}
};

/**
	Truncates the current array to the supplied length
**/
Array.prototype.truncate = function(length){
	return this.slice(0, length);
}

/**
	Returns a random character from the current string
**/
String.prototype.random = function( r ) {
	 var i = 0, l = this.length;
	 if( !r ) { r = this.length; }
	 else if( r > 0 ) { r = r % l; }
	 else { i = r; r = l + r % l; }
	 return this[ Math.floor( r * Math.random() - i ) ];
};

/**
	Returns a random element from the current array
**/
Array.prototype.random = function( r ) {
	 var i = 0, l = this.length;
	 if( !r ) { r = this.length; }
	 else if( r > 0 ) { r = r % l; }
	 else { i = r; r = l + r % l; }
	 return this[ Math.floor( r * Math.random() - i ) ];
};

/**
	Boolean check to find out if a supplied character is in the current string
	@note: include has replaced contains
**/
String.prototype.include = function(value) {
	return(this.indexOf(value) != -1); 
};

/**
	Boolean check to find out if a supplied element/string is in the current array
	@note: include has replaced contains
**/
Array.prototype.include = function(value) {
	return(this.indexOf(value) != -1); 
};

/**
	Boolean check to find out if an array contains any elements
**/
Array.prototype.any = function(){
	return !(this && this.constructor==Array && this.length==0);
};

/**
	Sanitize content containing URLs or mailto/email references
**/
String.prototype.sanitize = function(){
	return this.replace(/(([fh]+t+p+s?\:\/)+([^"'\s]+))/gi,"<a href=\"$1\" target=\"_blank\">$1<\/a>").
	  replace(/([a-z0-9\-\.]+\@[a-z0-9\-]+([^"'\s]+))/gi,"<a href=\"mailto:$1\" target=\"_blank\">$1<\/a>");
};



// Helper methods used by SocketStream to get and set session cookies
// Cookies are set by the browser, not via the server in HTTP headers to allow full caching of the static index.html file

window.getCookie = function(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";",c_start);
      if (c_end == -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start,c_end));
    }
  }
  return "";
};

window.setCookie = function(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
};
