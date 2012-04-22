# Request Middleware

Request Middleware는 소켓스트림 0.3에서 소개되는 가장 강력한 기능중에 하나입니다. 이것은 웹소켓, HTTP API, 콘솔에서 들어오는 요청을 살펴보고(inspect), 변형하고(transform), 다른곳으로 던지거나(redirect), 버릴(drop) 수 있습니다.
<!---
One of the most powerful and exiting features introduced in SocketStream 0.3 is Request Middleware. This has the power to inspect, transform, redirect or drop incoming requests over the websocket, HTTP API, or console.
-->

<!---
-->
If you've used Connect HTTP middleware before the concept and API will be instantly familiar. Essentially incoming requests can be processed through a chain of middleware BEFORE they arrive at their final destination - typically the RPC command you are requesting.

미들웨어는 내부으로, 외부 모듈으로, 직접 장성해서 지원할 수 있습니다.
<!---
Middleware can be provided internally, via external modules, or custom-defined in your app.
-->

어쩃든, 모든 미들웨어는 `server/rpc`폴더 밑의 코드에서 `req.use()`명령으로 부릅니다.
<!---
Regardless, all middleware is invoked using the `req.use()` command from within your `server/rpc` code.
-->


### 내부 미들웨어

지금 SocketStream에서는 두가지의 간단한 내부 미들웨어를 지원합니다: `debug`, `session`.
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

`session` 미들웨어는 다음 액션을 실행하기 전의 유저세션을 세션스토어에서 꺼내옵니다.
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



### Creating your own Middleware

어플리케이션에서 커스텀 미들웨어를 직접 만드는건 쉽습니다.
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

  // 곱할 숫자를 두번쨰 인자로 넘김
  req.use(multiplyNumber, 2);

  return {
    showResult: function(n){
      res('The incoming number is ' + n);
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
    next() // indicates middleware is finished processing
-->

브라우저에서 태스트 해 봅시다:
<!---
Let's test this out in the browser:
-->

    ss.rpc('app.showResult', 80)   // outputs "The incoming number is 160" to the console


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

  // check user is logged in before proceeding
  req.use(checkAuthenticated);

  return {
    topSecret: function(){
      // this function will only be called if user is logged in
      res(bankCodes);
    }
  }
}

// define custom middleware to ensure user is logged in
checkAuthenticated = function(){

  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res('Access denied'); // prevent request from continuing
  }

}
```

<!---
-->
You could take this one step further and load the user's data from a database and attach it to `req.user`.


### Sharing middleware across multiple files

<!---
-->
Once you've created your custom middleware you'll probably want to use it across multiple files. SocketStream makes this easy by allowing middleware to be placed in `server/middleware` and loaded into an API Tree.

<!---
-->
For example let's move the `checkAuthenticated` function above to its new home in `server/middleware/admin/user.js`:

```javascript
// server/middleware/admin/user.js
exports.checkAuthenticated = function(){

  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res(false); // Access denied: prevent request from continuing
  }

}
```

이제 `server/rpc`폴더 아래에 있는 어떤 파일에서도 이 함수를 부를수 있습니다:
<!---
You can now call this function from any `server/rpc` file with:
-->

    req.use('session');
    req.use('admin.user.checkAuthenticated');

<!---
-->
Note: `req.use('session')` must be called first as the `checkAuthenticated` middleware uses the `req.session` object.

<!---
-->
Although you strictly don't have to, we highly recommend creating at least one folder in `server/middleware` to store your custom middleware to prevent any future namespace conflicts.


### Food for thought

<!---
-->
Request Middleware allows for many exciting new opportunities around models and scaling.

<!---
-->
For example you could write your own middleware which handles CRUD requests (create, update, delete, etc) and forwards them directly to MongoDB, or use [Hook.IO](https://github.com/hookio/hook.io) to forward incoming requests to a different system altogether.

<!---
-->
Bear in mind there's no need to define any RPC actions at all if your middleware can respond to all incoming requests.

<!---
-->
We'll be exploring all these ideas in the future when time permits, but you don't have to wait for us. Start experimenting today and publish your middleware module on npm for everyone to use.
