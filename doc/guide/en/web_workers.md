# Web Workers

Web Workers provide a great way for modern browsers to execute complex tasks and calculations without blocking the main thread.

SocketStream makes it easy to work with Web Workers by providing transparent compilation (if you're using CoffeeScript) and automatic minification & caching when you call `ss.client.packAssets()`

To read more about Web Workers in general, take a look at: http://www.html5rocks.com/en/tutorials/workers/basics


### Getting started

Web Workers live in `/client/workers`. We don't create this folder by default, so you'll need to do that first.

Each worker should be written as a separate `.js` or `.coffee` file (if you have the `ss-coffee` module installed). For this tutorial we'll be using JavaScript.


### Basic Example

Let's create a worker which will calculate Pi using the [Leibniz Formula](http://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80):


```javascript
// in /client/workers/pi.js

self.addEventListener('message', function(e) {
  var cycles = e.data;
  postMessage("Calculating Pi using " + cycles + " cycles");
  var numbers = calculatePi(cycles);
  postMessage("Result: " + numbers);
}, false);

function calculatePi(cycles) {
  var pi = 0;
  var n  = 1;
  for (var i=0; i <= cycles; i++) {
    pi = pi + (4/n) - (4 / (n+2));
    n  = n  + 4;
  }
  return pi;
}
```

Then, in any client-side code file, invoke the worker.

```javascript
// in any /client/code file
var worker = ss.load.worker('/pi.js');

// print output to console
worker.addEventListener('message', function(e) {
  console.log(e.data);
});

// start worker with 10000000 cycles
worker.postMessage(10000000);
```

A few seconds after the task has run you should see the output in the browser's console:

    Calculating Pi using 10000000 cycles
    Result: 3.1415926485894077

Experiment with running more cycles and passing different messages.
