<!---# Testing your app-->
# 앱 테스트하기

<!--Note: This feature is brand new and still in the 'experimental' stage. Please help us by reporting any problems so we can perfect server-side testing in future releases.-->

주의: 이 기능은 완전히 새로운 기능이며, 아직 '실험'단계입니다. 문제를 발견하시면 저희에게 알려주세요. 그러면 다음번 릴리즈에서는 서버-사이트 테스트기능은 더 완전해질 것입니다.

<!--SocketStream allows you to test your app using Node's `assert` module, or any test framework of your choice. We recommend using [Mocha](http://visionmedia.github.com/mocha) with [should.js](https://github.com/visionmedia/should.js). This is the combination used in the example below.-->
소켓스트림에서는 Node의 'assert'모듈을 사용해서 앱을 테스트할 수 있습니다. 아니면 다른 테스트 프레임워크를 사용할 수도 있습니다. [Mocha](http://visionmedia.github.com/mocha) 와 [should.js](https://github.com/visionmedia/should.js)를 조합하여 사용하는 것을 추천합니다.  아래의 예제에서는 이 두 개의 조합을 사용하였습니다.

<!---### Getting Started-->
### 시작하기

<!--First install `mocha` and `should.js`:-->
우선은 `mocha`와 `should.js`를 설치하세요:

    [sudo] npm install -g mocha
    [sudo] npm install -g should

<!--Create a directory for your tests:-->
그런 다음 테스트할 폴더를 만드세요:

    mkdir test

<!--For this example we're going to test the `ss.rpc('app.square')` function shown below:-->
다음의 예제에서는 `ss.rpc('app.square')` 기능을 테스트합니다:

```javascript
// in/server/rpc/app.js
exports.actions = function(req, res, ss) {

  return {

    square: function(number) {
      res(number * number);
    }

  }
}
```

<!--Create a new test file in the `/test` directory:-->
`/test` 폴더 안에 새로운 테스트 파일을 만드세요:

```javascript
// /test/app.js 폴더 안에서
var ss = require('socketstream').start();

describe('app.square', function(){

  it('는 수를 제곱해야 합니다.', function(done){

    ss.rpc('app.square', 4, function(params){
      params.toString().should.equal('16');
      done();
    });

  });

});
```


<!--Run all your tests in `/test` with:-->
다음을 사용해서 `/test` 안에서 테스트를 실행하세요.

    mocha

<!--And you'll see the following output:-->
그러면 다음과 같은 결과가 나올 것입니다:

    ✔ 1 test complete (1ms)


<!--A few things to note about RPC tests:-->
RPC 테스트에 대해 몇 가지 언급해둡니다:

<!--* All `ss.rpc()` commands return an array of params (e.g. `[16]` in the example above). As two `array`s cannot be directly compared in Javascript, it is necessary to convert the response to a `string` before calling `should.equal()`-->
* `ss.rpc()` 명령어는 모두 매개변수 배열을 반환합니다. 위의 예에서는 `[16]`입니다. 자바스크립트에서는 두 개의 `배열`을 직접 비교할 수 없기 때문에, `should.equal()`을 호출하기 전에 응답을 `string`으로 바꿔해야 합니다.

<!--* Create as many test files as you like. Subsequent calls to `var ss = require('socketstream').start();` will return the same server instance from memory-->
* 원하는 개수만큼 테스트 파일을 만드세요. 한 번 호출한 이후에, `var ss = require('socketstream').start(); 이렇게 호출하면, 메모리로부터 같은 서버 객체(server instance)를 반환할 것입니다.


<!--- ### Sessions -->
### 세션

<!--A new Session (with a unique ID) is automatically created for you the first time you `start()` SocketStream. This allows you to test `ss.rpc()` commands which use `req.session.userId`.-->
처음 소켓스트림을 `start()` 해주면, 고유한 ID를 갖는 새로운 세션이 자동으로 만들어집니다. 이렇게 하면 `req.session.userId`를 사용하는 `ss.rpc()` 명령어를 테스트할 수 있습니다.

<!---### What can I test?-->
### 무엇을 테스트할 수 있나요?

<!--Right now you can only test `ss.rpc()` commands. Once we finalize the API, you'll soon be able to test all third-party Request Responders (e.g. models) in a similar way.-->
네 맞습니다. 지금은 `ss.rpc()` 명령어만 테스트할 수 있습니다. 일단 저희가 API를 완성하면, 곧 모든 서드-파티 Request Responders(예: models)를 테스트할 수 있을 것입니다.

<!--We are also considering implementing a mock Publish Transport, to allow you to test `ss.publish()` commands.-->
또한 여러분이 `ss.publish()` 명령어를 테스트할 수 있도록, 목업상태의 Publish Transport를 구현하려고 고려하고 있습니다.

