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
  return(this.charAt(0).toUpperCase() + this.substring(1))
};