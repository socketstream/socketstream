<!---# Authentication-->
# 인증

<!--Users can be authenticated in two ways: over the websocket or over HTTP.-->
인증은 웹소켓이나 HTTP으로 할수 있습니다.

<!--The first option is useful if you're authenticating against a backend database or other resource you control, the second if you're using a third-party service such as Facebook Connect.-->
첫번째 방법은 직접 관리하시는 데이터베이스나 리소스에 인증하고 있을때  유용하고, 두번째 방법은 페이스북같은 외부 인증을 사용할때 유용합니다.

<!--Either way, the goal is the same: to update `req.session.userId` with the user's unique ID.-->
어떤 방법이든 '`req.session.userId`에 사용자 고유의 ID를 넣고 싶다.'라는 목표는 같습니다.

<!---### Authenticating over websockets-->
### 웹소켓을 통한 인증

<!--This is the best choice if you're authenticating against an internal database or LDAP server, etc.-->
내부의 데이터베이스 또는 LDAP서버 등 에 인증하고 있다면 이것이(웹소켓이) 최고의 선택일 거에요.

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // SocketStream에게 session 데이터를 로드하도록 명령
  req.use('session');

  return {
    authenticate: function(username, password){

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
<!--
  // tell SocketStream to load session data
      // lookup user in DB, LDAP, etc
-->
<!--Note: You could just set`req.session.userId` manually, but calling the `req.session.setUserId()` function saves the session and notifies SocketStream to immediately start sending events for this user (sent using `ss.publish.user()`) over the current websocket connection.-->
주의: 당신이 `req.session.userId`을 그냥 수동으로 바꿀 수도 있지만, 그렇게 하기보단 `req.session.setUserId()`를 호출해 세션을 저장하고 현재의 웹소켓 연결을 사용하여 SocketStream에게 이 유저의(`ss.publish.user()`를 사용하여 전송) 이벤트 전송이 시작됬음을 알리는게 좋습니다.

<!---### Authenticating using HTTP-->
### HTTP이용한 인증

<!--Since the same session object is also available over HTTP you may easily authenticate a user by updating `req.session.userId` whilst processing a HTTP request.-->
같은 세션 객체는 HTTP를 통하여도 가능하기 때문에 HTTP Request를 처리하는 동안 `req.session.userId`을 변경하여 인증할 수 있습니다.

<!--Let's look at a very simple example by adding the following 'route' to `app.js`:-->
다음에 나오는 'route'를 `app.js`에 추가한 매우 쉬운 예제를 봅시다:

```javascript
// app.js
ss.http.router.on('/authenticateMe', function(req, res) {
  req.session.userId = '나솔';
  req.session.save(function(err){
    res.serve('main');
  });
});
```

<!--Next, add an RPC action which sends the contents of `req.session.userId` over the websocket:-->
다음으로 웹소켓을 통해 `req.session.userId`의 컨텐츠들를 전송하는 RPC를 추가합니다.

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // SocketStream에게 session 데이터를 로드하게 명령
  req.use('session');

  return {

    getCurrentUser: function(){
      res('현재 사용자는 ' + req.session.userId + '님 입니다.');
    }

  }
};
```
<!---// tell SocketStream to load session data-->

<!--Now visit `http://localhost:3000/authenticateMe` then enter the following command in the browser's console:-->
이제 `http://localhost:3000/authenticateMe` 가서 브라우저 콘솔에 다음 명령을 실행해보세요:

    ss.rpc('app.getCurrentUser')

<!--And you'll see the following output:-->
그러면 다음 결과가 출력 됩니다:

    현재 사용자는 나솔님 입니다.

<!---### Using Everyauth for Facebook Connect, Twitter, Github etc-->
### Facebook Connect, Twitter, Github 등의 위한 Everyauth 사용

<!--SocketStream integrates well with popular authentication libraries such as [Everyauth](https://github.com/bnoguchi/everyauth).-->
SocketStream은 [Everyauth](https://github.com/bnoguchi/everyauth)같은 널리쓰이는 인증 라이브러리들과 잘 통합됩니다.

<!--Tip: Don't be tempted to follow the docs on the Everyauth website too closely - they are mainly geared at multi-page apps and/or specific to Express.-->
팁: Everyauth 웹사이트의 문서를 너무 자세히 따르지 마세요 - 그것들은 주로 여러페이지를 가진 어플리케이션에 적합한 내용이거나 Express를 위한 겁니다.

<!--Here's an example of a full app which authenticates against Twitter's OAuth service.-->
트위터의 oAuth서비스에 대한 인증을 하는 전체 app의 예제입니다.

<!--To get started, register your new app at https://dev.twitter.com/apps/new-->
시작하기전에 https://dev.twitter.com/apps/new 에서 당신의 새 앱을 등록하세요.

<!--When testing your app supply `http://127.0.0.1:3000` as the Callback URL. Change this to the real URL when your app goes into production.-->
당신의 앱을 테스트 할때 콜백 URL로 `http://127.0.0.1:3000`이 제공됩니다. 당신을 앱을 제품으로 만들때 할때 이것을 실제 URL로 변경해야 합니다.

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
  .consumerKey('여기에 CONSUMER ID 를 입력')
  .consumerSecret('여기에 CONSUMER SECRET 를 입력')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var userName = twitterUserMetadata.screen_name;
    console.log('트위터 유저이름: ', userName);
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

// http://local.host:3000/auth/twitter 에서 인증해볼수 있습니다.
```
<!--// To authenticate visit http://local.host:3000/auth/twitter-->

<!--Many more details on this and other examples coming soon.-->
인증에 대한 더 상세한 설명과 예제들이 곧 나올꺼에요.
