// Extends the basic objects available to Node with helpers used throughout SocketStream
// New methods should be added with extreme care after a lot of thought

Array.prototype.include = function(value){
  return(this.indexOf(value) != -1);
};

Array.prototype.intersect = function(array){
  return(this.filter(function(n){ return array.include(n); }));
};

Array.prototype.delete = function(value){
  return(this.filter(function(n){ return n != value; }));
};

Array.prototype.any = function(){
  return(this.length > 0);
};

String.prototype.capitalized = function(){
  return(this.charAt(0).toUpperCase() + this.substring(1));
};

// Merges associative arrays. http://onemoredigit.com/post/1527191998/extending-objects-in-node-js
Object.defineProperty(Object.prototype, "extend", {
  enumerable: false,
  value: function(source) {
    var destination = this;
    for (var property in source) {
      if (source.hasOwnProperty(property)) {
        destination[property] = source[property];
      }
    }
    return destination;
  }
});

// Output the keys within an object
Object.defineProperty(Object.prototype, "keys", {
  enumerable: false,
  value: function() {
    var keys = [];
    for(i in this) { if (this.hasOwnProperty(i)) { keys.push(i); } }
    return keys;
  }
});
