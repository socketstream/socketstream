# Extends the basic objects available to Node with helpers

Array::includes = (value) ->
  @indexOf(value) > -1

Array::intersect = (array) -> 
  @filter((n) -> array.includes(n))

Array::remove = (value) ->
  @filter((n) -> (n isnt value))

Array::any = ->
  @length > 0

Array::last = ->
  @[@length-1]

Array::unique = ->
  startIndex = 0
  value for value in @ when !~@indexOf(value, ++startIndex)

String::capitalize = ->
  @charAt(0).toUpperCase() + @slice(1).toLowerCase()

String::contains = (word) ->
  @indexOf(word) > -1

# Cast @ to Number as coffeescript does not allow == testing http://wtfjs.com/2010/07/15/typeof-number-is-not-number
Number::pluralize = (singular, plural) ->
  plural = singular+'s' if plural is undefined
  if Number(@) is 1 then @+' '+singular else @+' '+plural

# Merges associative objects. http://onemoredigit.com/post/1527191998/extending-objects-in-node-js
Object.defineProperty Object.prototype, "extend",
  enumerable: false
  value: (source) ->
    recursive = (source, destination) ->
      for own property of source
        if typeof(destination[property]) is 'object'
          destination[property] = recursive(source[property], destination[property])
        else
          destination[property] = source[property]
      destination
    recursive(source, @)

# Output the keys within an object
Object.defineProperty Object.prototype, "keys",
  enumerable: false
  value: -> Object.keys(@)
