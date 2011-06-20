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

Array.prototype.last = function(){
  return(this[this.length -1]);
};

Array.prototype.unique = function() {
  var a = [];
  var l = this.length;
  for(var i=0; i<l; i++) {
    for(var j=i+1; j<l; j++) {
      // If this[i] is found later in the array
      if (this[i] === this[j])
        j = ++i;
    }
    a.push(this[i]);
  }
  return a;
};

String.prototype.capitalized = function(){
  return(this.charAt(0).toUpperCase() + this.substring(1));
};

String.prototype.contains = function(word){
  return(this.indexOf(word) > 0);
};

Number.prototype.pluralize = function(singular, plural){
  if (plural == undefined) plural = singular + 's';
  return this + ' ' + (this == 1 ? singular : plural);
};

// Merges associative objects. http://onemoredigit.com/post/1527191998/extending-objects-in-node-js
Object.defineProperty(Object.prototype, "extend", {
  enumerable: false,
  value: function(source) {
    var recursive = function(source, destination) {
      for (var property in source) {
        if (source.hasOwnProperty(property)) {
          if (typeof(destination[property]) == 'object')
            destination[property] = recursive(source[property], destination[property]);
          else
            destination[property] = source[property];
        };
      };
      return destination;
     };
     return recursive(source, this);
  }
});

// Output the keys within an object
Object.defineProperty(Object.prototype, "keys", {
  enumerable: false,
  value: function() { return Object.keys(this) }
});

