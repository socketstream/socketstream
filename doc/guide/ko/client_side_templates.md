<!---# Client-Side Templates-->
# 클라이언트측 템플릿들

<!--Client-side templates generate HTML in the browser, allowing SocketStream to send raw, layoutless data over the websocket.-->
클라이언트 측 템플릿들은 브라우저에서 웹소켓으로 SocketStream이 원시 layout없는 데이터를 보낼 수 있는 HTML을 생성합니다.

<!--This not only dramatically reduces bandwidth, but also gives you flexibility to render the data into HTML in any number of ways.-->
이것은 극적으로 대역폭을 줄일수 있을 뿐만 아니라 당신에게 여러 방법으로 데이터에서 HTML로 렌더링(정제) 할 수 있는 유연성을 줍니다.

<!---### Why use client-side template ?-->
### 왜 클라이언트 측 템플릿을 써야 하나?

<!--If your app is really simple, you might be happy manually building your HTML using jQuery functions:-->
만약 당신의 앱이 정말 단순 하다면, jQuery 함수만으로도 만족스럽게 HTML을 작성할 수도 있습니다.

```coffee-script
# client/code/main/index.coffee
people = [
  { name:'Alice', major:'Astronomy' }
  { name:'Bob',   major:'Biology' }
]
$(document).ready ->
  for person in people
    $('#people').append("<li>#{person.name} 님은 <strong>#{person.major}</strong>전공 입니다.</li>")
```

<!--However, not only does this solution scale poorly for larger templates, but mixing together display logic and HTML is bad practice. Enter client-side templates.-->
하지만, 이 방법은 큰 템플릿일 경우 좋지 않을 뿐 아니라 HTML과 표현 로직을 을 함께 섞어 쓰는 것은 나쁜 관행입니다. 이제 클라이언트측 템플릿들을 살펴봅시다.


<!---### Template Engines-->
### 템플릿 엔진들

<!--SocketStream supports two types of client-side template engines out-of-the-box:-->
SocketStream 기본적으로 두가지 형식의 클라이언트-측 템플릿 엔진들을 지원합니다:

##### default

<!--Simply wraps each template in a DIV tag with an ID prefix of 'tmpl-'.-->
간단히 각 DIV태그에 'tmpl-'의 접두어 아이디를 함께 랩핑합니다.

<!--Suitable for use with many template engines, including jQuery Templates (as used by SocketStream 0.2). Used by default if no template engine is specified.-->
(SocketStream 0.2에서 처럼) jQuery 템플릿등 많은 템플릿 엔진과 함께 사용하기 적합합니다. 만약 특별히 템플릿 지정하지 않았다면 default가 사용됩니다.

##### ember

<!--Outputs templates in the correct format for Ember.js. No prefix is added.-->
Ember.js에 대한 올바른 포멧으로 템플릿을 출력합니다. 접두어는 추가되지 않습니다.

<!--To use a built-in template engine, pass the name as a string:-->
내장된 템플릿 엔진을 사용하기 위해서, 문자열 이름을 전달:

```javascript
ss.client.templateEngine.use('ember');
```

<!--As built-in template engines are only simple wrappers, most of the time you'll want to use one of the several template languages supported via optional modules on NPM:-->
내장된 템플릿 엔진은 정말 단순한 래퍼이기 때문에, 대부분은 NPM에 선택적 모듈을 통해 지원되는 몇가지 템플릿 언어 중에 한가지를 이용하기를 원할 겁니다.

<!--
* [ss-hogan](https://github.com/socketstream/ss-hogan) Mustache templates (compiled on the server, requires small client-side lib). This is our recommended template engine.
* [ss-coffeekup](https://github.com/socketstream/ss-coffeekup) CoffeeKup templates (compiled on the server, no client-side code required)
* [ss-clientjade](https://github.com/sveisvei/ss-clientjade) Client-side Jade templates (compiled on the server, requires small client-side lib)
-->
* [ss-hogan](https://github.com/socketstream/ss-hogan) Mustache templates (서버에서 컴파일, 작은 클라이언트측 라이브러리 필요). 이것이 우리가 추천천하는 템플릿 엔진입니다.
* [ss-coffeekup](https://github.com/socketstream/ss-coffeekup) CoffeeKup templates (서버에서 컴파일, 클라이언트측 코드 필요 없음)
* [ss-clientjade](https://github.com/sveisvei/ss-clientjade) Client-side Jade templates (서버에서 컴파일, 작은 클라이언트측 라이브러리 필요)

<!--To use an external optional template engine, pass the module as so:-->
외부 템플릿 엔진을 사용하기 위해서는,  모듈을 전달 해야합니다:

```javascript
ss.client.templateEngine.use(require('ss-hogan'));
```

<!--If you can't find a module for your favorite templating library it's easy to [create your own](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md).-->
당신이 선호하는 템플릿라이브러리를 위한 모듈을 찾을 수 없다면 쉽게 [자신의 것](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md) 을 생성 할 수 있습니다.
<!--(!!! 머지 시점에서 위에 문서 링크 [자신의 것](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md) 적당히 바꿔준다.)-->


<!---### Mix and match different template engines-->
### 다른 템플릿 엔진들과 같이 쓰기

<!--All client-side templates live in the `client/templates` folder; however you don't have to serve every template with the same engine.-->
모든 클라이언트 템플릿들은 `client/templates`폴더 안에 있습니다; 하지만 같은 엔진과 모든 템플릿을 제공하지 않아도 됩니다.

<!--SocketStream allows you to mix and match different templates, perfect for trying out something like Ember.js without having to convert all your exiting templates over at once.-->
SocketStream 당신이 다른 템플릿들을 같이 쓰는 것을 허용합니다, 예를들어 Ember.js같은 것을 시도해 볼때 기존에 짜놓은 템플릿들을 한꺼번에 변환하지 않아도 되게 해줍니다.

<!--You may limit the scope of a template engine by passing the name of a directory as the second argument.-->
두번때 인자로 디렉토리 이름을 전달하여 템플릿엔진의 범위를 재한 할 수 있습니다.

```javascript
// 모든 템플릿을  ss-hogan으로
ss.client.templateEngine.use(require('ss-hogan'));
// /client/templates/em 안은 별도로
ss.client.templateEngine.use('ember', '/em');
```
<!--// serve all templates with ss-hogan-->
<!--// apart from any in the /client/templates/em directory-->


<!---### Example-->
### 예제

<!--Here we're using the [Hogan](http://twitter.github.com/hogan.js/) templating library, using the `ss-hogan` module bundled by default when you create a new project.-->
여기서 우리는 [Hogan](http://twitter.github.com/hogan.js/) 템플릿 라이브러리로, 프로젝트를 생성할때 default로 번들된 `ss-hogan` 모듈을 이용하고 있습니다.

<!--In this folder, let's create a file called `person.html`:-->
이 폴더에 `person.html`파일을 만들어 보죠:

``` html
<!-- client/templates/person.html -->
<li>{{ name }} 님은 <strong>{{ major }}</strong>전공 입니다.</li>
```

<!--**NOTE:** If you prefer, you may use a formatter to construct your HTML templates. For example, to use Jade, use `.jade` instead of `.html` for your template's file extension.-->
**메모:** 혹시, HTML 템플릿을 쓰기 원한다면. Jade라면 `.html` 대신 `.jade`를 파일 확장자로 하세요.

<!--If you refresh the page and view the HTML source code you'll see a new `<script>` tag containing the compiled template.-->
페이지를 새로고친 후 HTML 소스를 보면 당신은 컴파일된 템플릿을 포함하는 새로운 `<script>`태그를 볼 수 있을 것입니다.

<!--The `person.html` file in the `templates` folder is now accessible via `ss.tmpl['person']`. If the file was in a subdirectory `model/person.html`, then it would be accessible via `ss.tmpl['model-person']`.-->
`templates` 폴더 안에 `person.html`파일은 이제  `ss.tmpl['person']`을 통해 접근할 수 있습니다. 파일이 `model/person.html` 처럼 서브디렉토리에 있다면 `ss.tmpl['model-person']`로 접근 할 수 있습니다.

<!--Now that we have a template, let's put it to good use by refactoring our code:-->
템플릿은 만들었습니다,  코드를 리펙토링해서 잘 동작하도록 집어 넣어 봅시다.

``` coffee-script
# in your client-side code
people = [
  { name:'Alice', major:'Astronomy' }
  { name:'Bob',   major:'Biology' }
]
$(document).ready ->
  for person in people
    $('#people').append ss.tmpl['person'].render(person)
```

<!--### Serving different templates to different clients-->
### 다른 클라이언트에 다른 템플릿들을 서비스 하기

<!--By default all templates will be sent to all single-page clients you define with:-->
기본적으로 모든 템플릿들은모든 당신이 정의한 것과 함께 싱글-페이지 클라이언트에 전송될 것입니다.

``` javascript
ss.client.define()
```

<!--However, by organizing your templates into directories, you can specify which templates will be sent to each client as so:-->
하지만, 디렉토리로 탬플릿을 정리해두면, 클라이언트별로 어떤 템플릿을 사용할지 정할 수 있습니다.

``` javascript
// app.js
ss.client.define('iphone', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'app'],
  tmpl: ['main', 'mobile']  // 'main' 과 'mobile' 디렉토리안 템플릿들만 전달함
});
```
