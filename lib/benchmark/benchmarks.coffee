# List benchmarks to run
exports.benchmarks = [

    name:        'Simple Request'
    description: '''
    Each backend worker must return a '1' as the result.
    No real work is done so performance is limited by network speed and serialization.
    It's also a test to see how fast a large number of messages can flow through ZeroMQ.
    Adding more backend workers is unlikely to increase performance.
    '''
    requests:     50000
    command:      'b:simple'
    enabled:      true
  ,

    name:        'Redis SET/GET'
    description: '''
    Each backend worker generates a random integer and uses this to create a unique hash key in Redis.
    It then reads the key back and replies with the original number if the values match.
    Adding more workers should result in reasonably increased performance providing bandwidth is good.
    If this test fails for you, ensure Redis is running and reachable from all back end workers.
    '''
    requests:     50000
    command:      'b:redis:setget'
    enabled:      true
  ,

    name:        'Blocking Work'
    description: '''
    Each backend worker processes must generate 1000 random strings of 20 chars each.
    Adding more workers on external boxes should give near-linear increases in performance
    as this benchmark is CPU bound. Multiply the rps figure by 1000 to see how many random
    strings your cluster is computing per second.
    '''
    requests:     10000
    command:      'b:work'
    enabled:      true

  ]