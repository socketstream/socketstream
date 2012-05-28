# 웹 워커
<!---# Web Workers-->

웹워커는 최근의 브라우저에서 메인스레드의 블로킹없이(역주:async로) 복잡한 테스크와 연산을 실행하고 좋은 방법입니다.
<!--Web Workers provide a great way for modern browsers to execute complex tasks and calculations without blocking the main thread.-->

소켓스트림은 웹워커를 사용하기 편하게 하기 위해 (커피스크립트를 사용한다면)투과 컴파일(transparent compilation 역주: 최적화된 js로 변환해주는걸 프레임 워크에서 해준다는 이야기에요.), 자동코드압축, `ss.client.packAssets()`를 했다면 캐쉬를 제공합니다.
<!--SocketStream makes it easy to work with Web Workers by providing transparent compilation (if you're using CoffeeScript) and automatic minification & caching when you call `ss.client.packAssets()`-->

웹 워커에대한 좀더 자세한 정보를 보고싶으시면: [html5rack의 웹워커 투토리얼](http://www.html5rocks.com/en/tutorials/workers/basics)을 읽으세요.
<!--To read more about Web Workers in general, take a look at: http://www.html5rocks.com/en/tutorials/workers/basics-->

### 시작하기
<!---### Getting started-->

웹워커는  `/client/workers`안에서 live합니다. 프레임워크에서는 이폴더를 만들지 않습니다. 필요하시면 만드세요.
<!--Web Workers live in `/client/workers`. We don't create this folder by default, so you'll need to do that first.-->

각 워커는 반드시 독립된 `.js` 나 (`ss-coffee`모듈을 인스톨 했다면) `.coffee`로 작성되어야 합니다. 이 투토리얼에서는 자바스크립트를 사용하겠습니다.
<!--Each worker should be written as a separate `.js` or `.coffee` file (if you have the `ss-coffee` module installed). For this tutorial we'll be using JavaScript.-->

### 기본 예제
<!---### Basic Example-->

[Leibniz 방정식](http://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80)으로 파이를 계산하는 워커를 만들어 봅시다.
<!--Let's create a worker which will calculate Pi using the [Leibniz Formula](http://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80):-->


```javascript
// /client/workers/pi.js 파일

self.addEventListener('message', function(e) {
  var cycles = e.data;
  postMessage("" + cycles + " 사이클로 파이를 계산 중");
  var numbers = calculatePi(cycles);
  postMessage("결과: " + numbers);
}, false);

function calculatePi(cycles) {
  var pi = 0;
  var n  = 1;
  for (var i=0; i <= cycles; i++) {
    pi = pi + (4/n) - (4 / (n+2));
    n  = n  + 4;
  }
  return pi;
}
```
<!--// in /client/workers/pi.js-->
<!--postMessage("Calculating Pi using " + cycles + " cycles");-->
<!--postMessage("Result: " + numbers);-->

그리고 클라이언트 코드 파일에서, 워커를 호출합니다.
<!--Then, in any client-side code file, invoke the worker.-->

```javascript
// /client/code 밑의 아무파일에서나
var worker = ss.load.worker('/pi.js');

// 콘솔에 출력
worker.addEventListener('message', function(e) {
  console.log(e.data);
});

// 10000000 사이클로 워커를 시작
worker.postMessage(10000000);
```
<!--// in any /client/code file-->
<!--// print output to console-->
<!--// start worker with 10000000 cycles-->

조금 시간이 지나 테스크가 끝나면 브라우져 콘솔에서 다음 출력을 볼수있습니다:
<!--A few seconds after the task has run you should see the output in the browser's console:-->

    10000000 사이클로 파이를 계산중
    결과: 3.1415926485894077
<!--Calculating Pi using 10000000 cycles-->
<!--Result: 3.1415926485894077-->

사이클을 좀 더 준다던가 다른 메세지를 넘겨서 실험해보세요.
<!--Experiment with running more cycles and passing different messages.-->
