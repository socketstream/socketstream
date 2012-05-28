# Request Middleware

Request Middleware는 소켓스트림 0.3에서 소개되는 가장 강력한 기능중에 하나입니다. 이것은 웹소켓, HTTP API, 콘솔에서 들어오는 요청을 살펴보고(inspect), 변형하고(transform), 다른곳으로 던지거나(redirect), 버릴(drop) 수 있습니다.
<!---
One of the most powerful and exiting features introduced in SocketStream 0.3 is Request Middleware. This has the power to inspect, transform, redirect or drop incoming requests over the websocket, HTTP API, or console.
-->

Connect HTTP 미들웨어를 사용해 보신 적이 있으면 지금 설명하는 컨샙과 api는 직관적이고 눈에 익으실 겁니다. 요점만 말하자면 들어오는 요청(보통은 요청한 RPC 명령들)은 최종 목적지에 도달하기 **전의** 미들웨어 체인으로 처리 할수 있습니다.
<!---
If you've used Connect HTTP middleware before the concept and API will be instantly familiar. Essentially incoming requests can be processed through a chain of middleware BEFORE they arrive at their final destination - typically the RPC command you are requesting.
-->

미들웨어는 내부으로, 외부 모듈으로, 직접 작성해서 지원할 수 있습니다.
<!---
Middleware can be provided internally, via external modules, or custom-defined in your app.
-->

어느 방법을 사용하던, 모든 미들웨어는 `server/rpc`폴더 밑의 코드에서 `req.use()`명령으로 부릅니다.
<!---
Regardless, all middleware is invoked using the `req.use()` command from within your `server/rpc` code.
-->


### 내부 미들웨어

현재 버전의 SocketStream에서는 두가지의 간단한 내부 미들웨어를 지원합니다: `debug`, `session`.
<!---
Right now SocketStream provides two simple internal middleware functions: `debug` and `session`.
-->

#### debug

`debug` 미들웨어는 디버그에 유용한 `req`객체의 내용을 터미널에 출력합니다. 원한다면 메세지의 출력 색상을 정하는 옵션을 넣어줄 수 있습니다.
<!---
The `debug` middleware will output the contents of the `req` object to the terminal, useful when you're debugging problems. It takes an optional argument indicating which color to output the message in:
-->

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // 모든 받은 요청을 콘솔에서 하늘색으로 출력
  req.use('debug', 'cyan');

  return {
    square: function(n){
      res(n * n);
    }
  }
}
```
<!---
  // output all incoming requests to the console in cyan
-->

#### session

`session` 미들웨어는 다음 액션을 실행하기 **전의** 유저세션을 세션스토어에서 꺼내옵니다.
<!---
The `session` middleware instructs SocketStream to retrieve the user's session from the session store BEFORE executing the next action:
-->

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // user의 session을 req.session에 할당
  req.use('session');

  return {
    square: function(n){
      res(n * n);
    }
  }
}
```
<!---
  // load user's session into req.session
-->

`req.session`에 어떻게 세션데이터가 들어있는지 보고 싶으시면,  `req.use('session')`이후에 `req.use('debug')`를 넣어보세요. 다시한번 강조하는데, 미들웨어를 부르는 순서는 매우 중요합니다.
<!---
Try adding `req.use('debug')` after `req.use('session')` to see how the session data has been loaded into `req.session`. Remember, the order you call middleware in is very important.
-->

### 서드파티 미들웨어 사용하기
<!---
### Using third-party middleware
-->

단순히 모듈이나 함수를 직접 넘기세요. 예를들면:
<!---
Simply pass the module/function directly. E.g:
-->

    req.use(require('text-utils').sanitize, {anyConfig: 'can be passed here'});



### 자작 미들웨어 만들기
<!---
### Creating your own Middleware
-->

어플리케이션에서 자작 미들웨어를 직접 만드는 건 쉽습니다.
<!---
Creating custom middleware in your application is easy.
-->

들어오는 값(첫번째 인자)을 곱하는 미들웨어를 만들어 봅시다.
<!---
Let's start by creating a function which multiplies incoming numbers (the first param).
-->

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // 곱할 숫자를 두번째 인자로 넘김
  req.use(multiplyNumber, 2);

  return {
    showResult: function(n){
      res('들어온 숫자는 ' + n);
    }
  }
}

// 자작 미들웨어
multiplyNumber = function(multiplier){

  return function(req, res, next){
    var = num = req.params[0];
    if (num && typeof(num) == 'number')
      req.params[0] = (num * multiplier);
    next() // 미들 웨어의 작업이 끝났다는 표시
  }

}
```
<!---
  // pass the multiplier to the second arg
// define my custom middleware function
      res('The incoming number is ' + n);
    next() // indicates middleware is finished processing
-->

브라우저에서 태스트 해 봅시다:

    ss.rpc('app.showResult', 80)   //  "들어온 숫자는 160" 를 콘솔에 표시
<!---
Let's test this out in the browser:

    ss.rpc('app.showResult', 80)   // outputs "The incoming number is 160" to the console
-->


#### 인증을 위해 미들웨어 사용하기
<!---
#### Using Middleware for Authorization
-->

Request Middleware 는 더 진행하기 전에 유저가 로그인되었는지를 채크하는 좋은 방법입니다:
<!---
Request Middleware is the perfect way to check if a user is authorized before proceeding further:
-->

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // 더 진행하기전에 유저가 로그인 했는지를 채크
  req.use(checkAuthenticated);

  return {
    topSecret: function(){
      // 이 함수는 로그인 했을때만 호출됨
      res(bankCodes);
    }
  }
}

// 유저가 로그인 했는지 확인하는 자작 미들웨어
checkAuthenticated = function(){

  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res('요청이 거부 되었습니다'); // 요청이 진행못하게 방지
  }

}
```
<!---
  // check user is logged in before proceeding
      // this function will only be called if user is logged in
// define custom middleware to ensure user is logged in
    res('Access denied'); // prevent request from continuing
-->

필요하다면 이다음 단계에서 사용할수 있도록 디비에서 읽어온 유저정보를 `req.user`에 넣어둘 수도 있습니다.
<!---
You could take this one step further and load the user's data from a database and attach it to `req.user`.
-->

### 여러 파일에서 미들웨어 공유하기
<!---
### Sharing middleware across multiple files
-->

한번 자작 미들웨어를 만드셨다면, 아마도 모듈화해서 여러 파일로 쪼개 관리하고 싶으실 겁니다. SocketStream은 이것을 쉽게 하기위해 `server/middleware`에 모아서 관리하도록 하고 API에서 읽어 오게합니다.
<!---
Once you've created your custom middleware you'll probably want to use it across multiple files. SocketStream makes this easy by allowing middleware to be placed in `server/middleware` and loaded into an API Tree.
-->

예를들어 `checkAuthenticated` 함수의 위치를 `server/middleware/admin/user.js`로 이동한다고 칩시다:
<!---
For example let's move the `checkAuthenticated` function above to its new home in `server/middleware/admin/user.js`:
-->

```javascript
// server/middleware/admin/user.js
exports.checkAuthenticated = function(){

  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res(false); // 요청이 거부됨: 요청이 진행되는걸 방지
  }

}
```
<!---
    res(false); // Access denied: prevent request from continuing
-->

이제 `server/rpc`폴더 아래에 있는 어떤 파일에서도 이 함수를 부를 수 있습니다:
<!---
You can now call this function from any `server/rpc` file with:
-->

    req.use('session');
    req.use('admin.user.checkAuthenticated');

주의: `checkAuthenticated`미들웨어에서 `req.session`객체를 사용하므로 `req.use('session')`는 먼저 불려져야합니다.
<!---
Note: `req.use('session')` must be called first as the `checkAuthenticated` middleware uses the `req.session` object.
-->

아마도 꼭 그럴 필요는 없을거라고 생각할수도 있겠지만, 네임스페이스 충돌을 피하기위해 자작 미들웨어는 `server/middleware`밑에 두는걸 강력히 추천합니다.
<!---
Although you strictly don't have to, we highly recommend creating at least one folder in `server/middleware` to store your custom middleware to prevent any future namespace conflicts.
-->

### 떡밥들
<!---
### Food for thought
-->

Request Middleware는 모델과 스케일링에 무궁무진한 활용방법이 있습니다.
<!---
Request Middleware allows for many exciting new opportunities around models and scaling.
-->

예를 들면 CRUD 리퀘스트를 처리하는 미들웨어(create, update, delete 등등)를 직접 작성하시고 몽고DB(MongoDB)에 올리세요. 아니면 [Hook.IO](https://github.com/hookio/hook.io)를 사용해서 들어오는 요청(request)을 여러가지 시스템에 전달해줘도 되고요.
<!--
For example you could write your own middleware which handles CRUD requests (create, update, delete, etc) and forwards them directly to MongoDB, or use [Hook.IO](https://github.com/hookio/hook.io) to forward incoming requests to a different system altogether.
-->

여러분이 작성한 미들웨어에서 들어오는 리퀘스트에 응답할 수 있다면, RPC 액션을 정의할 필요는 전혀 없습니다.
<!---
Bear in mind there's no need to define any RPC actions at all if your middleware can respond to all incoming requests.
-->

시간이 허락하면 이런 부분에 대해서도 나중에 다루겠습니다. 하지만 우리가 할때까지 기다리지 마세요. 오늘 바로 실험해보시고, 여러분이 만드신 미들웨어 모듈을 npm에다가 발행해보세요. 다른 사람들이 쓸 수 있도록이요.
<!---
We'll be exploring all these ideas in the future when time permits, but you don't have to wait for us. Start experimenting today and publish your middleware module on npm for everyone to use.
-->
