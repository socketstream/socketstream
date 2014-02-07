# 클라이언트측 코드
<!---# Client-Side Code-->

소켓스트림은 구조화된 클라이언트 측 자바스크립트를 서버 측 코드와 완벽히 동일한 방법으로 작성할수 있게 합니다. 양쪽의 모듈 공유도 쉽게 하구요.
<!--SocketStream allows you to write and structure client-side Javascript in exactly the same way as server-side code, allowing you to easily share modules between both.-->

### 모듈사용하기
<!---### How to use Modules-->

`libs`(아래 참조)디렉토리에 있지 않은 모든 파일은 모듈로 취급됩니다. 모듈은 서버쪽의 노드와 같은 감각으로 사용할 수 있습니다. 다른 모듈을  `require()`하는것도 모듈안에서 값을 케싱하는 것도요.
<!--All files which aren't `libs` (see below) are treated as modules. You have exactly the same ability to export functions, `require()` other modules, and cache values within modules as you do when writing server-side code in Node.js.-->

클라이언트 측 코드는 `/client/code`에 있습니다. 원하는 만큼 서브디렉토리를 만드셔도 됩니다. 모듈 참조는 상대패스로 할수도 있고(예를들면`require('../../image/processor')`) 절대패스로도(`require('/path/to/my/module.js')`) 할 수 있습니다. 전부 원하시는대로 움직일 겁니다. 단지 요청(`require()`)하지않은 모듈은 실행하지 않는것만 기억해두세요.
<!--Client-side code lives in `/client/code`. Create as many subdirectories as you wish. Reference your modules relatively, e.g. `require('../../image/processor')`, or absolutely `require('/path/to/my/module.js')`. It all work as you would expect, just bear in mind a module will never be executed unless it is explicitly `require()`'d.-->

팁: 브라우저 콘솔에서 `require.modules`을 쳐보면 `require()`가능한 모든 모듈의 목록을 보실수 있습니다.
<!--Top tip: Type `require.modules` in the browser console to see a list of all modules you can `require()` in your app-->


### 특별한 예외
<!---### Special Exceptions-->

브라우져와 서버를 퇴대한 비슷하게 하려고 노력하고 있지만, 아직 몇가지 특별한 경우가 있습니다:
<!--While we try to keep the experience between browser and server as similar as possible, there are a few special cases to be aware of:-->


#### 'libs' - 오래된 (커먼js가 아닌) 라이브러리들
<!---#### 'libs' - Legacy (non Common JS) Libraries-->

'libs'안에 있는 어떤 파일도 모듈로 취급되지 **않습니다.** 대신에 있는 어떤 수정도 없이 그대로 전송됩니다.  일반적으로 `window`오브젝트를 사용하는 제이쿼리나 다른 라이브러리는 `/client/code`안의 'libs'디렉토리에 둡니다.
<!--Any file which lives in a directory called 'libs' will NOT be served as a module. Instead these files will be sent as-is without any modification. Typically you'll want to ensure jQuery and other libraries which use the `window` variable are always placed in a `/client/code` directory called 'libs'.-->

Common JS라이브러리가 아닌 파일은 로드 순서가 매우 중요하므로 다음 둘 중에 하나는 하셔야 합니다. `libs`아래의 파일을 알파벳 순서로 정렬 해두던가(역주: 숫자도 좋음 `1_xxxx.js`, `2_xxxx.js`) `ss.client.define()`명령으로 명시적으로 각파일의 로딩순서를 적으세요.
<!--As load order is critically important for non Common JS libraries **either** name your files alphanumerically within the `libs` directory **or** list each file explicitly in your `ss.client.define()` command - your choice.-->


#### 'system' - 시스템 모듈
<!---#### 'system' - System Modules-->

시스템 모듈은 일반 모듈과 비슷하지만 한가지 중요한 차이점이 있습니다: 그건 / 없이 접근 할수있다는건데요. 노드js의 `require('url')` 나 `require('querystring')`를 생각하시면 이해하기 편하실꺼에요.
<!--System modules are similar to regular modules but with one important difference: they are accessed without a leading slash - just like you would `require('url')` or `require('querystring')` in Node.js.-->

근데 왜 이런 구별이 필요할까요? 왜냐하면 Backbone.js같은 라이브러리('libs' 디렉토리에 넣기보단 모듈로써 사용하고 싶을때)는 시스템 모듈에 의존하기 때문입니다. 이런 경우 백본은 `require('underscore')`를 내부적으로 요청합니다. 따라서 `backbone.js`랑 `underscore.js`는 `system`디렉토리에 있어야 하죠.
<!--So why do we need this distinction? Because some libraries such as Backbone.js (when used as a module, rather than in a 'libs' directory) depend upon other system modules. In this case Backbone calls `require('underscore')` internally, therefore both `backbone.js` and `underscore.js` must live in a `system` directory.-->

소켓스트림은 [Browserify](https://github.com/substack/node-browserify)의 코드를 사용하기 때문에, 'system'디랙토리도 노드의 inbuilt 모듈을 브라우저에서 사용할 수 있습니다.  https://github.com/substack/node-browserify/tree/master/builtins 로 가셔서 라이브러리를 복사해서 `system`을 부르는 `/client/code` 아무데나 붙여 넣으세요.
<!--As SocketStream uses code from [Browserify](https://github.com/substack/node-browserify), the 'system' directory also allows you to use one of Node's inbuilt modules in the browser. Just head over to https://github.com/substack/node-browserify/tree/master/builtins and copy the libraries you need into any directory within `/client/code` called `system`.-->


#### '/entry.js' - 항목 관리자
<!---#### '/entry.js' - A single point of entry-->

`/entry` 모듈은 특별한 차이점이 있는 일반 모듈입니다: 이 모듈은 모든 파일이 브라우저에 전송된 시점에서 자동으로 요청되는 단 하나의 모듈입니다.
<!--The `/entry` module is a regular module with a special distinction: it is the only module to be required automatically once all files have been sent to the browser.-->

`entry.js` (아니면 `entry.coffee`) 파일은 프로젝트를 만들때 자동적으로 생성됩니다. 이 파일엔 아주 조금의 셈플 코드가 들어있어, 아마도 이걸 수정해웹소켓 연결이 끊어지거나,  재연결 되거나, 다음 웹소켓 연결이 이루어지면 `require()`할 모듈을 설정하거나 할수있습니다.
<!--The `entry.js` (or `entry.coffee`) file is created for you by default when you make a new project. It contains a small amount of boiler-plate code which you may modify to handle the websocket connection going down, reconnecting, and (critically), what module to `require()` next once the websocket connection is established.-->


### 라이브러리가 'libs' 에 들어갈지 'system'에 들어갈지는 어떻게 구별해야 할까요?
<!---### Should I put library X in 'libs' or 'system'?-->

그건 `window`값에 접근하는가에 달려있습니다. 예를들어, Backbone.js는 Backbone.history를 사용해`window`객체를 접근하지 않는 이상 `system`에서 잘 작동합니다.
<!--It depends if it needs access to the `window` variable. For example, Backbone.js works great as a `system` module unless you're using Backbone.history as this requires access to `window`.-->


### 없는 모듈을 요청하면 어떤 일이 생기나요?
<!---### What happens if I try to require a module which doesn't exist?-->

브라우저 콘솔에서 에러를 보실수 있습니다. 앞으로는 소켓스트림에서 그런 일이 발생하기 전에 잡을수 있게 할 생각입니다.
<!--You'll see an error in the browser's console. In the future SocketStream will be able to catch these problems before they arise.-->


### 맞춤형 모듈 로딩
<!---### Loading modules on demand-->

모든 모듈을 한번에 브라우저에 보낼 필요는 없습니다. [필요할 때 로딩](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md)하게 할 수도 있어요.
<!--You don't necessarily have to send all modules to the browser at once, you can also [load them on demand](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md).-->


### 배경 정보
<!---### Background info-->

클라이언트 코드를 바로잡자는 것은 소켓스트림 프로젝트를 시작했을 때 소켓스트림의 중요한 목표중 하나였습니다.
<!--Getting client-code right was a major goal for SocketStream from the beginning.-->

웹 개발자들은 너무나 오랫동안 네임스페이스와 의존성을 관리할 방법이 없는 체로 구조화되지 않은 자바스크립트 파일 더미와 씨름해야만 했습니다.
<!--For too long web developers have had to wade through a mess of unstructured JavaScript files without anyway to manage namespacing or dependencies.-->

이런 혼돈스러운 상태에서, [Require.js](http://requirejs.org)같은 해결책과 다른 AMD 접근법은 어느정도 질서를 가져올 수 있었습니다만, 개발자들에게 의존성을 수동으로 목록을 만들고 추적해야하는 책임이 생겨 버렸습니다. 더 문제인 점은, 클라이언트와 서버에서 파일을 `require()`하고 싶을때 각각 다른 문법으로 하고 있었다는 점입니다. - 이것 때문에 클라이언트 와 서버의 파일공유하려는 시도는 꿈도 꿀 수 없었죠.
<!--Solutions such as [Require.js](http://requirejs.org) and other AMD approaches have successfully brought order to chaos, but put the onus on the developer to manually track and list dependencies. What's more, they use a different syntax to `require()` files - instantly killing all hopes of sharing the same file between the client and server.-->

소켓스트림에서는 좀 더 잘하고 싶었습니다. 결국, 소켓스트림은 클라이언트와 서버 스택을 모두 관리하는 독특한 프레임워크가 되어 버렸습니다. 이 솔루션은 [Browserify](https://github.com/substack/node-browserify) 덕분입니다. - 멋지고, 가볍고, 모든 문제를 한방에 해결해주는 라이브러리 였지요.
<!--We wanted to do much better with SocketStream. After all, we are in the unique position of managing both the client and server stack. The solution came in the form of [Browserify](https://github.com/substack/node-browserify) - an awesome, lightweight, library which solves all these problems once and for all.-->

소켓스트림은 Browserify 를 `package.json`에 추가하고 그 위에 구현을 추가하는 방식으로 개발하지는 않았습니다. 왜냐하면 거기에 우리가 필요없는 코드가 들어있었거든요, 하지만 우리는 거기에서 핵심 컴포넌트를 가져왔습니다.(`require()`라는 마법을 가능하게 해주는 핵심 코드를 포함해서요.) 이 까다로운 문제에 대한 깔끔한 해결책을 주신 Substack에게 감사합니다.
<!--SocketStream doesn't depend upon the Browserify module (as it contains code we don't need), but we use major components from it (including the critical code which performs all the `require()` magic). Our thanks go to Substack for coming up with a clean solution to a very tricky problem.-->
