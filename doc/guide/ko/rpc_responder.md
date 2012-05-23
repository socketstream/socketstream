# RPC Server-side Websocket Responder
# RPC 서버사이드 웹소켓 Responder

The RPC Responder 
allows you 
to call functions on the server 
from the browser over the websocket, 
returning a response if requested.  
RPC Responder는 당신이 브러우저의 웹소켓을 통해 서버의 함수들의 호출을 한 경우에 response를 반환 합니다.

It is powerful when used in conjunction with [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md).  
그것은 [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md)와 함께 할때 강력합니다. 

To make a Remote Procedure Call from the browser use the `ss.rpc()` function.  
브라우저에서 원격 프로시져 콜을 할수 있는 `ss.rpc()` 함수를 사용하세요.

Let's assume we want to return an array of the latest products in an online store.  
우리가 온라인 스토어의 최근의 제품들의 배열을 반환 하고 싶다고 가정합니다.

We would want to call the following command from the browser:  
브라우저에서 다음 명령을 호출 하도록 합시다. 

``` javascript
ss.rpc('products.latest', function(result){ console.log('The latest products are:', result); })
```

This command will be sent over the websocket and sent directly to the RPC Responder. But how will it know which function to call on the server?  
이 명령은 웹소켓을 통해 전송되고 직접적으로 RPC Responder에게 전달 될 것입니다.  

The RPC responder loads all commands in `server/rpc` into an API Tree.  
RPC Responder는 `server/rpc`아래 모든 명령들을  API 트리로 로드 합니다.

 Thus the command to call 'products.latest' will be matched to the 'latest' function in the 'products' file `/server/rpc/products.js`.  
그래서 그명령어는 `/server/rpc/products.js`.파일에서 'products' 안에 'latest'와 일치 되는 'products.latest'를 호출 할 것입니다.

The `products.js` file should contain the available actions as so:  
`products.js` 파일은 이처럼 적당한 action들을 포함해야 함.

``` javascript
// server/rpc/products.js
exports.actions = function(req, res, ss){

  return {

    latest: function(){
      res(['iPhone 4S', 'Dell LCD TV', 'HP Printer']);
    }

  }
}
```

### Sending Arguments
### 매개변수 전달

The RPC Responder can take and pass unlimited arguments intuitively.  
RPC Responder 는 무제한의 인자를 지관적으로 얻거나 전달 할 수 있습니다.

For example let's write another action on the server:  
예로 서버에 또 다른 액션을 작성하자:

``` javascript
// server/rpc/products.js
exports.actions = function(req, res, ss){

  return {

    topSelling: function(startDate, endDate, productType){
      // do calculations then send multiple args back to client...
      res(['iPad', 'iPhone', ...], 'Scooby Doo');
    },

    latest: function(){
      res(['iPhone', 'Dell LCD TV', 'HP Printer']);
    }

  }
}
```

To call this from the browser we'd use:  
이것을 우리가 사용하는 브러우저에서 호출:

``` javascript
// client/code/main/products.js
var productType = 'electronics';
ss.rpc('products.topSelling', '2012-01-01', '2012-01-31', productType, function(products, bestSalesperson) {
  console.log('The top selling products in ' + productType + ' were:', products);
  console.log('And the best salesperson was:', bestSalesperson);
})

```

You may pass as many arguments as you want - just remember the last argument should always be the callback if you're expecting a response from the server.
당신이 원하는 만큼 많이 전달 할수 있습니다. - 단 서버로부터 응답을 기대한다면 마지막 인자는 항상 콜백(함수)라는 것을기억하세요. 

### How does it work under the hood?
### 그것은 내부에서 어떻게 동작하는 것일까요?

The RPC Responder serializes messages in both directions using JSON.  
RPC Responder는 JSON을 이용하여 쌍방향으로 메세지들을 직렬화 합니다.

Thus the actual message sent over the wire is a string which looks like this:  
그래서 실제로 보내지 선을 넘어로(네트워크를 넘어로)보내지는 내용은 이런식의 문자열입니다:


    {id: 1, m: 'method.to.call', p: [param1, param2, ...]}
