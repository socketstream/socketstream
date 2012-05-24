# Authentication
# 인증

Users can be authenticated in two ways: over the websocket or over HTTP.  
사용자들은 두가지 방법으로 인증되어 질 수 있다: 웹소켓으로 또는 HTTP를 통해. 

The first option is useful if you're authenticating against a backend database or other resource you control, the second if you're using a third-party service such as Facebook Connect.  
백-앤드 데이터베이스 또는 제어하는 다른 리소스에 인증하고 있다면첫번째 방법이 유용하고 Facebook Connect같은 그런 서드파티 서비스를 이용하고 있다면 두번째 방법이 유용하다.

Either way, the goal is the same: to update `req.session.userId` with the user's unique ID.
어느 경우라도, 목표는 같다: `req.session.userId`를 사용자의 유니크 ID로 변경하기

### Authenticating over websockets
### 웹소켓을 통한 인증

This is the best choice if you're authenticating against an internal database or LDAP server, etc.  
내부의 데이터베이스 또는 LDAP서버 등 에 인증하고 있다면 이것이(웹소켓이) 최고의 선택이다.

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // tell SocketStream to load session data  
  // SocketStream에게 session 데이터를 로드하도록 명령
  req.use('session');

  return {
  	authenticate: function(username, password){
  		
      // lookup user in DB, LDAP, etc
      // BD, LDAP, 등에서 사용자 확인

      if (user) {
        req.session.setUserId(user.id);
        res(true);
      } else {
        res('Access denied!');
      }

  	}
  }
}

```

Note: You could just set`req.session.userId` manually, but calling the `req.session.setUserId()` function saves the session and notifies SocketStream to immediately start sending events for this user (sent using `ss.publish.user()`) over the current websocket connection.  
Note: 당신이 `req.session.userId`을 그냥 수동적으로 바꿀 수 있다. 그러나 호출한 `req.session.setUserId()` 함수는 세션을 저장하고 SocketStream에게 즉시 (`ss.publish.user()`를 사용하여 전송)이 사용자에게 이벤트 전송을 시작을 알린다.

### Authenticating using HTTP  
### HTTP이용 인증

Since the same session object is also available over HTTP you may easily authenticate a user by updating `req.session.userId` 
whilst processing a HTTP request.   
같은 세션 객체는 HTTP를 통하여도 가능하기 때문에 HTTP Request를 처리하는 동안 `req.session.userId`을 변경하여 인증할 수 있다.

Let's look at a very simple example by adding the following 'route' to `app.js`:  
다음에 나오는 'route'를 `app.js`에 추가한 매우 쉬운 예제를 보자:

```javascript
// app.js
ss.http.router.on('/authenticateMe', function(req, res) {
  req.session.userId = 'john';
  req.session.save(function(err){
    res.serve('main');
  });
});
```

Next, add an RPC action which sends the contents of `req.session.userId` over the websocket:  
다음으로 웹소켓을 통해 `req.session.userId`의 컨텐츠들를 전송하는 작업을 하는 RPC를 추가한다.

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // tell SocketStream to load session data
  // SocketStream에게 session 데이터를 로드하게 명령
  req.use('session');

  return {
    
    getCurrentUser: function(){
      res('The current user is ' + req.session.userId);
    }

  }
};
```

Now visit `http://localhost:3000/authenticateMe` then enter the following command in the browser's console:
이제 `http://localhost:3000/authenticateMe` 방문하라 그리고 브라우저 콘솔에 다음 내용을 입력하라:

    ss.rpc('app.getCurrentUser')
    
And you'll see the following output:
그러면 당신은 다음과 같은 결과를 볼 것이다.:

    The current user is john


### Using Everyauth for Facebook Connect, Twitter, Github etc
### Facebook Connect, Twitter, Github 등의 위한 Everyauth 사용 

SocketStream integrates well with popular authentication libraries such as [Everyauth](https://github.com/bnoguchi/everyauth).  
SocketStream은 [Everyauth](https://github.com/bnoguchi/everyauth)같은 유명한 인증 라이브러리들과 잘 통합된다.  

Tip: Don't be tempted to follow the docs on the Everyauth website too closely - they are mainly geared at multi-page apps and/or specific to Express.  
팁: Everyauth 웹사이트의 문서를 너무 자세히 따르지 마라 - 그것들은 주로 멀티페이지 앱에 연관되거나/또는 Express를 명시하고 있다.  

Here's an example of a full app which authenticates against Twitter's OAuth service.  
여기 트위터의 oAuth서비스에 대한 인증을 하는 전체 app의 예제가 있다. 

To get started, register your new app at https://dev.twitter.com/apps/new  
시작할때 https://dev.twitter.com/apps/new 에서 당신의 새 앱을 등록하라.

When testing your app supply `http://127.0.0.1:3000` as the Callback URL. Change this to the real URL when your app goes into production.  
당신의 앱을 테스트 할때 콜백 URL로 `http://127.0.0.1:3000`이 제공된다. 당신을 앱을 제품으로 만들때 할때 이것을 실제 URL로 변경하라.  

```javascript
// app.js
var http = require('http')
  , ss = require('socketstream')
  , everyauth = require('everyauth');

ss.client.define('main', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'modules', 'main']
});

ss.http.router.on('/', function(req, res) {
  res.serve('main');
});

everyauth.twitter
  .consumerKey('YOUR CONSUMER ID HERE')
  .consumerSecret('YOUR CONSUMER SECRET HERE')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var userName = twitterUserMetadata.screen_name;
    console.log('Twitter Username is', userName);
    session.userId = userName;
    session.save();
    return true;
  })
  .redirectPath('/');

ss.http.middleware.prepend(ss.http.connect.bodyParser());
ss.http.middleware.append(everyauth.middleware());

var server = http.Server(ss.http.middleware);
server.listen(3000);

ss.start(server);

// To authenticate visit http://local.host:3000/auth/twitter  
// 인증을 위해 http://local.host:3000/auth/twitter 방문
```

Many more details on this and other examples coming soon.  
이것에 대한 많고 더 상세함 과 다른 예제들이 곧 옵니다.