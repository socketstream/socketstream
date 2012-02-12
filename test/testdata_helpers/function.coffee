toArray = (enumerable) -> Array.prototype.slice.call(enumerable)

Function.prototype.curry = ->
    # nothing to curry with - return function
    return this if arguments.length < 1

    __method = this;
    args = toArray(arguments)
    return -> __method.apply(this, args.concat(toArray arguments))
