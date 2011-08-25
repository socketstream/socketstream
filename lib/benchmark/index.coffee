# Benchmark
# ---------

util = require('util')

log = require('../logger.coffee')
stack = require('./benchmarks.coffee').benchmarks

rpc = new (require('../rpc/connection.coffee')).Client('benchmark')

serialization = SS.config.cluster.serialization

exports.bannerText = ->
  [
    "Benchmark Suite"
    "RPC protocol using #{serialization.toUpperCase()} serialization"
  ]

exports.run = ->
  console.log '''
  Welcome to the SocketStream benchmark suite. It's early days yet but we're going to use this command to performance tune and stress test every part of infrastructure.

  Right now we're just testing the router and backend so make sure you start the router 'socketstream router' and at least one backend sever 'socketstream backend' before running this command.
  
  See how the load is spread across multiple CPU cores by experimenting with more backend servers on different machines (don't forget to define your SS.config.cluster TCP sockets first). Control how many workers are started per-box with the -w flag. E.g. 'socketstream backend -w 4' for a quad core machine.

  '''
  execute()


# Private

output = (msg, color) ->
  console.log log.color(msg, color)

execute = (i = 0) ->
  if stack[i]
    setTimeout (-> run(stack[i], -> execute(i + 1))), 1000
  else
    console.log "#{stack.length} benchmarks complete!\n"
    process.exit(0)

benchmark = (details) ->
  stack.push details

run = (details, next) ->

  return next() unless details.enabled

  # Can someone make a funky colored progress bar indicator here? :)
  printResults = -> console.log "#{recv} responses received"

  start = Number(new Date())
  sent = 0
  recv = 0
  last = 0

  output "Running #{details.name} benchmark\n", 'cyan'
  console.log details.description + "\n"
  console.log "Sending #{details.requests} requests to the back end (via the router) using #{serialization}"

  printer = setInterval(printResults, 1000)
  
  while sent < details.requests
    obj = {responder: details.command}
    sent++
    rpc.send obj, (result) ->
      recv++
      if recv == details.requests
        end = Number(new Date())
        taken = end - start
        output "#{details.requests} responses received from the backend in #{taken}ms (#{parseInt(details.requests/(taken/1000))} rps)\n\n", 'green'
        clearInterval printer
        next()
   


