<!---# Loading Assets On Demand-->
# 필요할때만 Assets을 불러오기


<!--If you're writing a small app you can safely ignore this section, as it's always better to pack all client assets into one file and send everything through together in one go if possible.-->

만들고 있는 앱이 작다면, 이 부분은 건너뛰어도 됩니다. 왜냐하면 가능하면, 클라이언트의 에셋 한 파일에다가 모아놓고, 한 번에 모두 보내는 편이 낫기 때문입니다.

<!--But what if you're writing a large app, or an app with multiple distinct sections like iCloud.com?-->
그러나 만들고 있는 앱이 크거나, 서로 구별되는 여러 개의 섹션을 가지는 경우에는 어떨까요? 예를 들면 iCloud.com의 경우처럼요.

<!--SocketStream allows you to load code (and other assets in the future) into your app asynchronously on demand.-->
소켓스트림에서는 요청이 있을 때마다 비동기적인 방식으로 코드를 앱에다가 로드할 수 있습니다. 나중에는 다른 에셋도 이렇게 할 수 있을 것입니다.


<!---### Loading Code-->
### 코드를 로드하기

<!--Sadly it's not possible to directly `require()` modules which haven't been loaded as the blocking nature of the `require` function means the browser would freeze until the module has been retrieved from the server - not good.-->

안타깝게도, 로드되어 있지 않은 모듈을 직접 `require()`할 수는 없습니다. `require` 함수는 서버로부터 모듈을 가져올 때까지 브라우저는 멈춥니다.

<!--However SocketStream allows you to load additional code modules from the server asynchronously using the built-in `ss.load.code()` command. Once all the code you've requested has been loaded, we execute a callback, allowing you to `require()` the new modules as normal without any fancy syntax.-->

하지만 소켓스트림에서는 `ss.load.code()` 명령어를 사용해서, 비동기적으로 서버에서 추가적인 코드 모듈을 로드할 수 있습니다. 일단 여러분이 요청하신 코드가 다 로드되면, 소켓스트림에서는 콜백을 수행합니다. 그래서 특별한 구문을 쓰지 않아도, `require()`를 사용해서 새로운 모듈을 로드할 수 있습니다.

<!--To try this out, create a new directory of application modules in `/client/code`. For the sake of this example, let's call our new directory `/client/code/mail`. We'll also assume this directory has a module in it called `search.js`.-->
직접 해보세요. 어플리케이션 모듈에 사용할 새로운 폴더를 `/client/code` 하위에 만드세요. 그리고 새로운 폴더에 `/client/code/mail`이라고 이름을 붙이세요. 이 폴더 안에는 `search.js`라는 모듈이 있다고 가정하겠습니다.
```javascript
//클라이언트쪽의 모듈
ss.load.code('/mail', function(){

  // /client/code/mail 안에 들어있는 모듈이 모두 로드되었습니다.
  // 루트의 네임스페이스인 (/)(??)는 보통의 방법으로 요청할 수 있습니다.

  var search = require('/search');

});
```
<!--  // all modules in /client/code/mail have now been loaded into-->
<!--  // the root namespace (/) and can be required in the normal way-->
<!--// in any client-side module-->



<!--Note: Regardless of the directory you load, the modules inside will always be loaded into the root (/) namespace by default. If you want to mount the new modules in a different namespace, just create one or more sub-directories in the folder you're loading.-->

주의하세요: 여러분이 로드하는 폴더와 상관없이, 폴더 안에 있는 모듈은 별도의 설정이 없으면 항상 루트 (/) 안에 로드될 것입니다. 새로운 모듈을 다른 네임스페이스 안에 마운트하시려면 로드하시려는 폴더를 하나 만들거나, 로드하는 폴더 안에 하위 폴더를 하나 만드세요.


<!---### Automatic Caching-->
### 자동 캐싱

<!--Modules are only ever retrieved from the server once. Subsequent requests for the same directory will be returned instantly without contacting the server.-->
모듈은 서버로부터 한 번만 가져옵니다. 동일한 폴더에 대해 그 이후에 이루어지는 요청은 서버와 접속하지 않고 바로 반환됩니다.
