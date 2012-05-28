# 세션
<!---# Sessions-->

소켓스트림은 웹소켓과 http사이의 세션이 비슷한 api를 사용해 쉽게 공유 할수 있도록 하기 위해 커넥트의 세션스토어를 사용합니다.
<!--SocketStream uses the Connect Session Store to ensure sessions can be easily shared between HTTP and Websocket requests using a similar API.-->

이것은 소켓스트림에서 적은 데이터를 익스프레스나 커넥트를 사용했다면 어떤 페이지 기반의 프레임 워크에서도 사용할수 있다는 이야기가 됩니다. 특히나 인증을 구현할 때 유용하죠.
<!--This means you're able to write data to a session from SocketStream and then use it in Express.js or any other page-based framework which uses Connect - especially useful when performing authentication.-->


### 웹소켓을 통해 세션 사용하기
<!---### Using Sessions over Websockets-->

속도 최적화와 유연성을 위해, 웹소켓 요청이 처리될 때 세션 데이터는 기본적으로 검색하지 않도록 되어있습니다. 세션으로 무언가 하고 싶으시면 [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md)의 설명에 따라 내부 `session`을 활성화 할 필요가 있습니다.
<!--For optimum speed and flexibility, session data is not retrieved by default when a websocket request is processed by the server. Before you do anything with sessions, you'll need to activate the internal `session` [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md) as shown below:-->

``` javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // req.session에 세션 데이터를 할당
  req.use('session');

  return {

    testAction: function(){
      console.log('이 요청은 이제 세션을 사용할 수 있습니다:', req.session);
    }

  }
}
```
<!--// Load session data into req.session-->
<!--console.log('This request now has session data:', req.session);-->

#### 세션 데이터 넣고 빼기
<!---#### Getting/Setting Custom Session Data-->

``` javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // req.session에 세션 데이터를 할당
  req.use('session');

  return {

    getSession: function() {
      console.log('새션의 내용물은:', req.session);
    },

    updateSession: function(){
      req.session.myVar = 1234;
      req.session.cart = {items: 3, checkout: false};
      req.session.save(function(err){
        console.log('세션 데이터 저장됨ㅋ:', req.session);
      });

    }

  }
}
```
<!--// Load session data into req.session-->
<!--console.log('The contents of my session is', req.session);-->
<!--console.log('Session data has been saved:', req.session);-->

### HTTP를 통해 세션 사용하기
<!---### Using Sessions over HTTP-->

HTTP통해 접글할때는 같은 세션 데이터가 자동적으로 `req.session`안에 할당됩니다. 예를들어,  `app.js`안에 이런 라우터가 있다고 합시다:
<!--The same session data is automatically loaded into `req.session` when accessed over HTTP. For example, append this route to your `app.js` file:-->

``` javascript
// app.js
ss.http.router.on('/updateSession', function(req, res) {
  req.session.myVar = 4321;
  res.end('변경된 req.session.myVar = ', req.session.myVar);
});
```
<!--res.end('req.session.myVar has been updated to', req.session.myVar);-->

주의: `res.end()`를 콜할때는 `req.session.save()`를 콜할 필요가 없습니다.
<!--Note: There is no need to call `req.session.save()` if you're calling `res.end()`.-->


### 세션 스토어
<!---### Session Stores-->

메모리에 저장되는 커넥트 세션 스토어는 개발 편의성을 위해 기본값으로 재공 됩니다. 하지만 실서버를 운영한다면 **반드시** 메모리 누수를 막기위해 영속적인 백엔드를 사용해야 합니다.
<!--The in-memory Connect Session Store is used by default to allow you to start developing easily. Before your app goes into production you **must** use a Connect Session Store with a persistent backend to avoid memory leaks.-->

`connect-redis`라는 이름의 번들은 일반적이고 좋은 선택입니다. 사용하시려면 밑에 코드를 `app.js` 파일에 추가하세요.
<!--We have bundled the `connect-redis` store as standard as this makes an excellent choice. To use it, add the following line to your `app.js` file:-->

    ss.session.store.use('redis');

어떤 라디스의 설정도 두번째 인자로 넘길수 있습니다. (예를들면 `{port: 1234}`).
<!--Any Redis configuration can be passed to the second argument (e.g `{port: 1234}`).-->


### 세션의 자동 만료
<!---### Auto-expiring Sessions-->

기본적으로 세션은 30일 이후에 만료됩니다. 그전에 세션이 만료되지 않으면 말이죠(뭐 브라우져를 닫는다던가). 다른 세션 만료 시간을 설정하고 싶으시면 밑에 코드를 `app.js` 파일에 추가하세요.
<!--By default sessions will expire within 30 days, unless the session is terminated beforehand (e.g. the user closes the browser). To set a different expiry time put the following in your `app.js` file:-->

    ss.session.options.maxAge = 8640000;  // 하루를 백분의1초단위로 환산
<!--ss.session.options.maxAge = 8640000;  // one day in miliseconds-->

