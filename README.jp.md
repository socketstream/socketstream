![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/public/images/logo.png)


Latest release: 0.1.8   ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))

Twitter: [@socketstream](http://twitter.com/#!/socketstream)
Google Group: http://groups.google.com/group/socketstream
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode


### イントロダクション

SocketStrem は、[Single-page Application](http://en.wikipedia.org/wiki/Single-page_application)パラダイムにあわせて開発された新しいフルスタックWebフレームワークです。
websocket や、インメモリデータベース（Redis）、クライアントサイドでのレンダリングを取り入れることで、驚くほどのレスポンスを実現しています。

プロジェクトの状態: 利用できますが実験段階です。日々改善しています。

最近の開発状況や考えは [@socketstream](http://twitter.com/#!/socketstream) よりご覧になれます。近日中に Webサイトを公開します。

### 特徴

* websocket（またはflashsocket）を使った双方向通信です
* 非常に高速です！　起動は一瞬で、スローダウンの原因になるリクエストごとの HTTPハンドシェイク/ヘッダ/ルーティングはありません
* Chrome と Safari で問題なく動きます。Firefox や IE での動作は不安定ですが、[Socket.IO](http://socket.io/) によって改善されつづけています
* 全てのコードは [CoffeeScript](http://jashkenas.github.com/coffee-script/) もしくは JavaScript にて記述します。好きな方を選んでください
* クライアント／サーバー間でコードを簡単に共有できます。ビジネスロジックやモデルの検証に最適です
* 3G回線の iPad や iPhone の Mobile Safari（iOS 4.2 以上）でも問題なく動きます
* オートマチック HTTP/HTTPS API。全てのサーバーサイドコードは高速なリクエストベースの API を介してアクセスできます
* スケーラブルでプライベートチャンネルを含む pub/subシステムを手軽につかえます。下記の例を参照してください
* 統合されたアセットマネージャー。全てのクライアントサイドアセットは自動的にパッケージングされ[ミニファイ](https://github.com/mishoo/UglifyJS)されます
* 自動HTTPリダイレクトによってすぐに使える HTTPS をサポートしています。下記の HTTPS のセクションを参照してください
* モジュール化された認証システムによる組み込みユーザモデル。ユーザのオンライン状態を自動的にトラッキングします（下記を参照してください）
* 対話的コンソール。'socketstream console' とタイプするだけで、お好きなサーバーサイド／共有メソッドを呼び出せます
* 'API ツリー' によって、フロントからバックエンドをまたぐ巨大なコードベースの名前空間を、シンプルで一貫したものにできます
* セッションの検索、pub/sub、オンラインユーザの一覧表示など、即時性が要求されるデータの扱いには [Redis](http://www.redis.io/) を使います
* カスタム HTTP middleware/responders をサポートします。これらは柔軟性とスピードを最大限にするために最初に実行されます
* jQuery と [jQuery templates](http://api.jquery.com/category/plugins/templates/) が含まれています。これは Rails の partial のように動きます
* [Underscore.js](http://documentcloud.github.com/underscore/) のようなクライアントライブラリを簡単に追加できます
* 初期HTMLレイアウトは [Jade](http://jade-lang.com/) かプレーンHTML で書けます
* [Stylus](http://learnboost.github.com/stylus/) を CSS生成に使えます
* MITライセンスです


### どのように動作するの？

ユーザの初回アクセス時、SocketStream は全ての静的 HTML、CSS、クライアントサイドコードを自動的に圧縮しミニファイして送信します。

その後、全てのデータはシリアライズされた JSONオブジェクトとして websocket（もしくは 'flashsocket'）トンネル経由でやりとりされます。
トンネルはクライアントが接続した直後に生成されます。また、切断しても自動的に再生成されます。

つまり、コネクションレイテンシ、HTTPヘッダによるオーバーヘッド、扱いにくいAJAX呼び出しが無いのです。
SocketStream は、正真正銘の双方向で非同期な'ストリーミング'通信をクライアント／サーバ間で可能にします。

### 何をつくれるの？

SocketStream が得意なのはリアルタイムデータ（チャット、株式取引、位置のモニタリング、分析など）を扱うモダンなアプリケーションです。
ブログ等、SEO のためにユニークな URL を必要とするコンテンツリッチなサイトには、今のところ向きません。

### チュートリアル

[SocketStream でつくるリアルタイムな CoffeeScript Webアプリケーション](http://addyosmani.com/blog/building-real-time-coffeescript-web-applications-with-socketstream/) by [Addy Osmani](http://addyosmani.com)


### サンプルアプリ集

これらのアプリは今のところ小さなものですが、コードを読むことで SocketStream の学習に役立つでしょう。

[SocketChat](https://github.com/addyosmani/socketchat) - シンプルなグループチャット

[Dashboard](https://github.com/paulbjensen/socketstream_dashboard_example) - 設定可能なウィジェットを持つリアルタイムダッシュボード

[SocketRacer](https://github.com/alz/socketracer) - マルチプレイヤーレーシングゲーム


### ざっくりわかる SocketStream

SocketStream を使いこなす鍵になるのが 'SS' グローバル変数です。これはサーバ／クライアントサイドのどこからでも呼び出せます。

例えば、数を二乗するシンプルなサーバーサイドの関数を書いてみましょう。このコードを /app/server/app.coffee ファイルに追加してください。


``` coffee-script
exports.actions =

  square: (number, cb) ->
    cb(number * number)
```

この関数をブラウザから呼び出すために、下記のコードを /app/client/app.coffee ファイルに追加してください。

``` coffee-script
exports.square = (number) ->
  SS.server.app.square number, (response) ->
    console.log "#{number} の二乗は #{response}"
```

サーバーを再起動してページをリフレッシュした後、次のコードをブラウザのコンソールから入力してください。

``` coffee-script
SS.client.app.square(25)
```

以下のように出力されたと思います。

    25 の二乗は 625

注意深い人なら SS.client.app.square(25) が実際には 'undefined' を返していることに気がつくでしょう。この動作は正常です。注目すべきはリクエストが処理された後にサーバーから非同期に送られるレスポンスです。

サーバーサイドで作成したメソッドは組み込みの HTTP API を使って下記の URL で呼び出すこともできます。

``` coffee-script
/api/app/square?25                        # ヒント: .json を使うとファイルに出力できます
```

サーバーサイドのコンソール('socketstream console' とタイプ)や、ブラウザのコンソール、他のサーバーサイドのファイルから呼び出すこともできます。

``` coffee-script
SS.server.app.square(25, function(x){ console.log(x) })
```

注釈: ブラウザから SS.server メソッドを呼び出した場合、'console.log' コールバックが自動的に挿入されます。

'SS' 変数が jQuery の '$' に似ていることに気がつかれたかもしれません。'SS' は SocketStream API にアクセスする主要な方法です。クライアント／サーバ間で API が同じになるように私たちはベストをつくしています。

さあ、もっと深い内容に進みましょう。準備はいいですか？　それでは HTML5 Geolocation を使ったリバースジオコーディング（Reverse geocoding）を見てみましょう。


### 例: リバースジオコーディング

サーバーコードとして /app/server/geocode.coffee を作成して下記のコードをペーストしてください。

``` coffee-script
exports.actions =

  lookup: (coords_from_browser, cb) ->
    host = 'maps.googleapis.com'
    r = coords_from_browser.coords
    http = require('http')
    google = http.createClient(80, host)
    google.on 'error', (e) -> console.error "#{host} に接続できませんでした"
    request = google.request 'GET', "/maps/api/geocode/json?sensor=true&latlng=#{r.latitude},#{r.longitude}"
    request.end()
    request.on 'error', (e) -> console.error "#{host} からのレスポンスのパースに失敗しました"
    request.on 'response', (response) => parseResponse(response, cb)

parseResponse = (response, cb) ->  # 注釈: プライベートメソッドは exports.actions の外側に書かれている
  output = ''
  response.setEncoding('utf8')
  response.on 'data', (chunk) -> output += chunk
  response.on 'end', ->
    j = JSON.parse(output)
    result = j.results[0]
    cb(result)
```

現在地を取得してその住所を出力するために次のコードを /app/client/app.coffee に追加してください。

``` coffee-script
# 注釈: SS.client.app.init() メソッドは、ソケットが作成されてセッションが利用可能になった時に、自動的に一度だけ呼び出されます。
exports.init = ->
  SS.client.geocode.determineLocation()
```

次にクライアントサイドの名前空間（下記セクション参照）を試すため /app/client/geocode.coffee ファイルを作成し、以下のコードを書いてください。

``` coffee-script
exports.determineLocation = ->
  if navigator.geolocation
    navigator.geolocation.getCurrentPosition(success, error)
  else
    alert 'なんということでしょう。お使いのブラウザでは Geolocation がサポートされていません。実装されるそのときまでお待ちください'

# プライベートな関数

success = (coords_from_browser) ->
  SS.server.geocode.lookup coords_from_browser, (response) ->
    console.log response
    alert 'あなたの現在地: ' + response.formatted_address

error = (err) ->
  console.error err
  alert 'おっと。現在地を見つけられませんでした。オンラインになってますか？'
```

コードを実行すると現在地が表示されます（WiFi 環境下なら、より正確な位置になります）。もちろん実際にはクライアントへのコールバックの処理を実行中に起こりうる様々なエラーに対応する必要があるでしょう。

おまけ: 再実行はどうすればできるでしょうか？　'SS.client.geocode.determineLocation()' とブラウザのコンソールでタイプするだけです。すべての 'exportされた' クライアントサイドの関数はこの方法で呼び出せます。


### 例: Pub/Sub

チャットアプリやユーザへのプッシュ通知を作るにはどうすればよいでしょうか？

まず始めにクライアント側で 'newMessage' イベントをリッスンしましょう。

``` coffee-script
exports.init = ->
  SS.events.on('newMessage', (message) -> alert(message))
```

通知を行いたいユーザの ID を知っていると仮定します。サーバーサイドで次のように書くことでユーザにメッセージを通知できます。

``` coffee-script
exports.actions =

  testMessage: (user_id) ->
    SS.publish.user(user_id, 'newMessage', '超カッコイイ！')
```

ね、簡単でしょう？　魅力はこれだけではありません。ユーザがどのサーバーに接続しているかを気にする必要はありません。SocketStream サーバーは Redis の共通インスタンスを見ているのでメッセージは常に正しいサーバへ送られます。

全ユーザへブロードキャストする方法や、プライベートチャンネルを実装する方法を知りたいですか？　それなら後述の 'Pub/Sub をもっと知る' セクションを読んでください。


### 動作環境

[Node 0.4](http://nodejs.org/#download) か、それ以降のバージョン（0.5.1 でも動作しますが、0.4.x を推奨します）

[NPM 1.0](http://npmjs.org/) （Node Package Manager）か、それ以降のバージョン

[Redis 2.2](http://redis.io/) か、それ以降のバージョン


### SocketStrem を動かそう

SocketStream を実際に動かしてみましょう。SocketStrem はまだ実験段階にありますが、私たちは新しいプロジェクトで SocketStream をつかって日々改善しています。

SocketStream は NPMパッケージとして公開されています。インストールは以下のコマンドをタイプするだけです。

    sudo npm install socketstream -g

新規の SocketStream プロジェクトを作成するには次のようにタイプしてください。

    socketstream new <name_of_your_project>

生成されるディレクトリの構成は Railsユーザにはおなじみでしょう。構成の概要は下記のとおりです。

#### /app/client
* /app/client ディレクトリ配下の全ファイルはクライアントに送られます。CoffeeScript ファイルは自動的に JavaScript ファイルに変換されます
* 使いたい JavaScript ライブラリは /lib/client に配置してください
* development と staging モードでは、ブラウザ上でサーバサイドのメソッドを呼ぶと、メソッド名がコンソール上に表示されるので呼び出しを確認できます（翻訳者注釈: 0.1.8 で developmentモードだけでなく stagingモードでも確認できたのでモードを追加しました）
* SS.client.app.init() 関数は、websocketコネクションの確立時に自動的に一度だけ呼び出されます
* 従って、/app/client/app.coffee（もしくは app.js）ファイルは必須です
* /app/client 配下にディレクトリを作成できます。詳しくは、名前空間セクションを参照してください。

#### /app/server
* このディレクトリに配置されたすべてのファイルは、昔ながらの MVCフレームワークにおけるコントローラと同じように動作します
* 例えばクライアントから app.init に引数 25 を渡して呼び出すには、SS.server.app.init(25) とクライアント上で実行します
* すべてのメソッドは自動的に HTTP の API としてもアクセス可能になります（e.g. /api/app/square.json?5）
* すべてのメソッドは事前にロードされるので、コンソールや他のサーバーサイドのファイルから SS.server 経由でアクセスできます
* メソッドに値が渡されると、それらは最初の引数にまとめられます。最後の引数は常にコールバック関数（cb）です（翻訳者注釈: 原文には pushed into the first argument とありますが、実際には第二引数以降は切り捨てられるようです。0.2.0 からは対応されるようです http://bit.ly/nf9sFC）
* すべてのパブリックなメソッドは 'exports.actions' のプロパティとして定義されます。プライベートなメソッドはそのスコープの外側に配置されます。定義は 'methodname = (params) ->' と書きます
* サーバー側のファイルはネストできます。例えば SS.server.users.online.yesterday() と書けば、/app/server/users/online.coffee に定義された yesterday メソッドが呼び出されます
* 同じファイルの中で名前空間をわけるためにオブジェクトをネストすることもできます
* @getSession でユーザのセッションにアクセスできます
* @user でカスタムユーザのインスタンスにアクセスできます。詳細は近日中に公開します

#### /app/shared
* 'コードの共有' セクションを見てください

#### /app/css
* /app/css/app.styl は必須です。これは SASS に似た [Stylus](http://learnboost.github.com/stylus/) フォーマットで書きます
* 外部Stylusファイルは app.styl で @import 'name_of_file' と書くとインポートできます。ファイルはネストできます
* CSSライブラリ（例: reset.css や jQuery UI など） を使いたい場合、それらを /lib/css に配置するか、ホスティングされている CDNファイルへのリンクを /app/views/app/jade に書いてください
* Stylusファイルは自動的にコンパイルされ、developmentモードの場合、そのまま送られます。staging もしくは production モードの場合、プリコンパイル、圧縮、キャッシュされます

#### /app/views
* /app/views/app.jade もしくは /app/views/app.html は必須です。アプリの初期表示するための静的HTML を書いてください
* [Jade](http://jade-lang.com/)（HAML に似ています）フォーマットを使えます（正しい HTML構文が保証されるため使用をオススメします）
* HTML の HEADタグには Jade では '!= SocketStream' を、プレーンHTML では '<SocketStream>' を含めます。このヘルパーによって環境（SS_ENV で指定します）ごとにライブラリをただしく読み込みます
* Jade と HTML 両方で jQuery template（Rails の partial に似ています）を使って別ファイルにわけた HTML を簡単に取り込めます。例えば /app/views/people/customers/info.jade に書いた部分テンプレートは $("#people-customers-info").tmpl(myData) とアクセスできます
* ビューとテンプレートは自動的にコンパイルされ、developmentモードの場合、そのまま送られます。staging や production モードの場合、プリコンパイル、圧縮、キャッシュされます

#### /lib
* /lib/client や /lib/css 配下のファイルを変更すると、自動的に再コンパイル、パッキング、ミニファイされます
* 新規ファイルをそれらのディレクトリに追加しても上記の処理は行われません（したがってサーバの再起動が必要です）。現在開発チームが対応しています
* ライブラリ名の先頭に数字をつけることで、ライブラリの読み込み順を簡単に指定できます（例: 1.jquery.js, 2.jquery-ui.js）
* クライアント側の JSファイルは、ファイル名に '.min' が含まれていないと [UglifyJS](https://github.com/mishoo/UglifyJS) によって自動的にミニファイされます
* /lib/server 配下の全ファイルは、Node でフルパスを指定せずに require できます。カスタム認証モジュールや、クライアントに公開せずにサーバーサイドのファイル間でコードを共有する方法として理想的です

#### /public
* 静的ファイルを配置してください（例: /public/images, robots.txt など）
* /index.html と /public/assetsディレクトリは SocketStream によって管理されるので変更を加えないでください

#### /static
* 警告や通知用のファイルを格納します。サイトに応じて変更を加えてください

#### /vendor
* ベンダ製のライブラリは /vendor/mycode/lib/mycode.js のフォーマットに沿って配置してください
* このディレクトリの使用は任意です


アプリを起動する前にローカルで Redis2.2+ が起動していることを確認したら下記のコマンドをタイプします。

    socketstream start


正常に起動すると SocketStream のバナーが表示され SocketStream を始める準備ができました！


### 設定ファイル

SocketStream はデフォルトで __development__モードで稼働し、すべてのリクエストとレスポンスはターミナルに表示され、サーバサイドで発生したあらゆる例外はブラウザのコンソールに表示され、すべてのクライアントアセットはデバッグ用にそのままコンパイルされます。

__development__モードの他に __staging__ と __production__ の二つのモードを利用できます。それぞれモードごとの用途にあった設定で SocketStream をロードします。

プリセット変数の上書きや追加は、設定ファイルを書き換えることで行えます。アプリケーション全体に適用される設定ファイルは /config/app.coffee で、それぞれの環境に適用される設定ファイルは /config/enviroments/<SS_ENV>.coffee です（例: /config/environments/development.coffee）。なお、<SS_ENV>.coffee は app.coffee の設定を上書きします。

__development__モード以外の環境で SocketStream を立ち上げるには SS_ENV環境変数を使います。

    SS_ENV=staging socketstream start

追加できる環境の数に制限はありません。どの環境で動作しているかは SocketStreamコンソール上で SS.env とタイプすると容易に確認できます。

すべての設定可能な環境変数は近日公開予定のサイトにてお知らせします。現在は SocketStreamコンソール上で SS.config とタイプすることですべての設定可能な環境変数を確認できます。

README を読んでいると、コンフィグ変数を変更しているような下記の表記をたびたび目にするでしょう。

    SS.config.limiter.enabled = true

この場合、設定ファイルで次のように書くことで環境変数の値を変更できます。

``` coffee-script
exports.config =
  limiter:
    enabled: true
```

### ロギング

クライアントとサーバーサイドのロギングは __development__ と __staging__ モードではデフォルトでオン、__production__ モードではオフになっています。
ロギングの設定は SS.config.log.level と SS.config.client.log.level の値によって変更できます。
ロギングのレベルには 0 から 4 までの 5段階を設定できます。数字が大きいほど冗長なロギングをします。デフォルトのレベルは 3 です。

細かいことに煩わされず何が起きているのかちゃんと知るために、頻繁に繰り返されるサーバーへのリクエスト（例: 位置情報の送信）の度にロギングしたくない時もあるでしょう。その場合は次のように 'silent' オプションを SS.serverコマンドに追加します。

``` coffee-script
SS.server.user.updatePosition(latestPosition, {silent: true})
```

### Redisとの通信

Redis は、サーバサイドからグローバル変数R でアクセスできます。

``` coffee-script
    R.set("string key", "string val")

    R.get("string key", (err, data) -> console.log(data))    # 'string val' を出力する
```

Redis のホスト、ポート番号、データベース／キースペースのインデックスは SS.config.redis によって設定できます。development／staging／production ごとにデータを格納するために SS.config.redis.db_index の値を設定したくなるかもしれません。

key や pub/subチャンネルなど、SocketStream が内部で使用する全てのキーの先頭には 'ss:' が付きます。それ以外のダブらないキーをアプリケーション内で使えます。

[Redis の全コマンド一覧](http://redis.io/commands)


### データベースとの接続

かゆいところに手が届くような DB 接続フレームワークの開発は、将来のリリースで重要視しています。ですが現在は mongoDB の接続のみサポートしています。

/config/db.coffee（もしくは .js）が存在する場合、起動時に自動で読み込まれます。下記のようにデータベースの設定を書けます。

``` coffee-script
mongodb = require('mongodb')   # installed by NPM
Db = mongodb.Db
Connection = mongodb.Connection
Server = mongodb.Server
global.M = new Db('my_database_name', new Server('localhost', 27017))
M.open (err, client) -> console.error(err) if err?
```
これによってグローバル変数M で mongoDB にアクセスできるようになります。

/config/db.coffee は対象の環境の設定ファイルが読み込まれた後にロードされます。例えば development モードにおける DB接続の設定は /config/environments/develpment.coffee に次のように書けます。

``` coffee-script
exports.config =
  db:
    mongo:
      database:     "my_database_name"
      host:         "localhost"
      port:         27017
```

development.coffee で定義した値を使って /config/db.coffee の設定を行えます。

``` coffee-script
config = SS.config.db.mongo
global.M = new Db(config.database, new Server(config.host, config.port))
```

CouchDB や MYSQL 等、その他の DB についてはテストをしていませんが、動作の原理は一緒です。


### 名前空間（クライアントサイドのコードと共有コード）

JavaScriptベースの Webアプリ開発というエキサイティングな世界には、ファイルをどこに配置して、プロジェクトの成長に合わせてどのように構成していくのかという誰もが頭をかかえる問題があります。

SocketStream は、全てのクライアントサイドのファイルと共有ファイルを「APIツリー」に対応づけるという新しいアプローチをとっています。APIツリーはグローバル変数 SS.client と SS.shared で参照できます。サーバサイドのコードは少し異なる動作をしますが、基本的には同じです（SS.server で参照します）。

使い方はシンプルです。'exports.' をプリフィックスにしていないすべてのブジェクト、関数、変数は自動的にプライベートになります。'exports.' をプリフィックスにすることでそれらは APIツリーに追加され、同じ環境のあらゆるファイルからアクセスできるようになります。

たとえば /app/client/navbar.coffee というファイルを作成し、下記のコードを追加します。

``` coffee-script
areas = ['Home', 'Products', 'Contact Us']

exports.draw = ->
  areas.forEach (area) ->
    render(area)
    console.log(area + ' は既に表示されました')

render = (area) ->
  $('body').append("<li>#{area}</li>")
```

'exports.' をプリフィックスにしている draw() メソッドはパブリックになるので、クライアントサイドのコードやブラウザのコンソールから呼び出せます。'areas' 変数と render() 関数はプライベートなので、グローバルの名前空間は汚染されません。

ディレクトリがネストした名前空間や深いオブジェクトツリーもサポートしています。SocketStream は起動時に、名前空間の衝突がないかどうかチェックします。わたしたち開発チームは、APIツリーが最もクールな機能の一つだと考えています。ぜひご意見・ご感想をお寄せください。

**まめ知識** キーストロークをとことん少なくしたいなら、SS.client のエイリアスをつくりましょう。

``` coffee-script
window.C = SS.client

C.navbar.draw()
```

### コードの共有

SocketStream の強力な機能の一つに、クライアント／サーバ間で同じ JavaScript/CoffeeScriptコードを共有できることがあげられます。クライアントとサーバの両方に都度コピーすればもちろん共有できますが、SocketStream はより素晴らしいソリューションを提供します。

共有コードの書き方や名前空間のマッピングはクライアントサイドのコードのそれらと同じですが、共有コードはクライアントとサーバ、両方の環境で動作します。使い方はシンプルで、/app/shared 配下にファイルを追加し、共有したい関数・プロパティ・オブジェクト・CoffeeScriptのクラスなどを export するだけです。

たとえば /app/shared/calculate.coffee というファイルを作成し、次のコードをペーストしてください。

``` coffee-script
exports.circumference = (radius = 1) ->
  2 * estimatePi() * radius

estimatePi = -> 355/113
```

これによってサーバとクライアントの両方から SS.shared.calculate.circumference(20) を呼びだせます！　コードの共有は、計算ロジック、フォーマット用ヘルパー、モデルのバリデーションといったものに適しています。なお、DOM、バックエンドで動く DB、Node.js のライブラリなど、どちらかの環境だけで動作する処理は共有しないでください。共有コードはサーバとクライアントの両方で動作する 'ピュア' なコードにしてください。

すべての共有コードは事前にロードされ APIツリーの SS.shared に追加されるので、サーバやブラウザのコンソールからいつでも呼び出せます。APIツリー上に estimatePi() が無いことに気づかれたかもしれません。なぜ無いのかというと、estimatePi() はプライベートで定義されているからです（コード自体はクライアントへ転送されています）。

**注意** /app/shared 内の全てのコードは、最初の接続時に圧縮されてクライアントへ送られます。誰かに見られたら困るコード、データベース／ファイルシステムの呼び出しなどは含めないでください。


### ヘルパー

SocketStream には JavaScript で作られたヘルパーメソッドが数多く用意されています。ヘルパーメソッドはプロジェクトの新規作成時につくられます。ヘルパーのコンセプトは Rails の ActiveSupport によく似ています。

ヘルパーは最初からサーバサイドの SocketStream にも組み込まれています。そのため、クライアントサイド、共有コード、サーバサイドのどこでも同じように使えます。どこで実行できるかを気にする必要がありません。

利用できるヘルパーは /lib/client/3.helpers.js を読むと確認できます。もしサードパーティのライブラリと競合してしまったり、ヘルパーそのものが不要なら、ファイルを削除してしまって問題ありません。


### セッション

ブラウザがサーバへ最初に接続したときに新しいセッションがつくられ、クライアントサイドではセッション用のクッキーが保存され、その詳細が Redis に永続化されます。同じブラウザから再度アクセスがあった場合（もしくはブラウザがリフレッシュした場合）、セッションは Redis からすぐに取り出されます。

現在のセッションオブジェクトは、サーバサイドで @getSession関数を呼び出すと取得できます。

``` coffee-script
exports.actions =

  getInfo: (cb) ->
    @getSession (session) ->
      cb("#{session.created_at} につくられたセッションです。")
```

### モジュール化されたユーザ認証

ユーザのログイン・ログアウト機能を必要とする Webアプリケーションは多いでしょう。そのため私たちは 'カレントユーザ' という概念を SocketStream に取り入れました。これは、開発をやりやすくさせるだけでなく、ちゃんとした pub/subシステムの開発、APIリクエストの認証、オンラインユーザのトラッキング（後述するセクションを参照してください）をするために欠かせないものです。

認証はモジュール化されているのでサクッと実装できます。たとえば、お手製の認証モジュールを /lib/server/custom_auth.coffee につくってみましょう。

``` coffee-script
exports.authenticate = (params, cb) ->
  success = # DB アクセスなど何かやる
  if success
    cb({success: true, user_id: 21323, info: {username: 'joebloggs'}})
  else
    cb({success: false, info: {num_retries: 2}})
```

* クライアントから送られるパラメータが第一引数に渡されていることに注目してください。一般的なパラメータは {username: 'something', password: 'secret'} といった値ですが、バイオメトリックID・iPhoneデバイスID・SSOトークンなど他のパラメータを追加できます。

* 第二引数はコールバック関数です。コールバック関数には必ず '認証の可否' を表す値（下記の例では 'success' 属性に設定）と 'user_id' パラメータ（数もしくは文字列）を渡す必要があります（'user_id' パラメータは認証が成功した場合のみ）。さらに、残りログイン試行回数など他のパラメータを追加してクライアントに送り返せます。

つくった認証モジュールを使うには、/app/server 内のコードで @getSession を呼び出して session.authenticate の第一引数にモジュール名を渡します。

``` coffee-script
exports.actions =

  authenticate: (params, cb) ->
    @getSession (session) ->
      session.authenticate 'custom_auth', params, (response) =>
        session.setUserId(response.user_id) if response.success       # session.user.id をセットして pub/sub を開始する
        cb(response)                                                  # 追加情報をクライアントに送る

  logout: (cb) ->
    @getSession (session) ->
      session.user.logout(cb)                                         # pub/sub を切断してまっさらな Sessionオブジェクトを返す
```

このようなモジュール化のアプローチによって、複数のユーザ認証を行えます。今後、Facebookコネクトのような共通認証サービスをサポートする予定です。

__重要__

認証が必要な /app/server 配下のファイルには下記のコードを先頭に書いてください。

``` coffee-script
exports.authenticate = true
```

それによってファイル内のメソッドが実行される前に、ログインチェックが行われるか、もしくは（Basic認証などで）プロンプトが表示されます。

一度ユーザが認証されれば、/app/server 配下のファイルより @getSession で session を取得して、session.user_id にアクセスするとユーザID を取得できるようになります。


### オンラインユーザのトラッキング

ユーザがログインできるなら、オンラインのユーザをトラッキングしたくなるでしょう --- リアルタイムチャットやソーシャルアプリをつくっているなら特にそうでしょう。幸運にもトラッキング機能は SocketStream に組み込まれています。

ユーザが認証に成功すると、そのユーザのID が Redis に永続化されます。オンラインユーザのリストは、サーバーサイドで次のメソッドを呼び出すことで取得できます。

``` coffee-script
SS.users.online.now (data) -> console.log(data)
```

ログアウトしたユーザは即座にリストから取り除かれます。さて、ユーザがブラウザを閉じた場合や、回線が切断した場合はどうなるのでしょうか？

SocketStream のクライアントは、超軽量な 'heartbeat' シグナルをデフォルトで 30秒ごとにサーバに送ることで、ユーザがオンラインであることを伝えます。サーバサイドでは1分ごとに起動するプロセスでシグナルをチェックしており、1分間応答のないユーザをリストから取り除きます。それらのタイミングは SS.config.client.heartbeat_interval と SS.config.users.online の値で調節できます。

注釈: 'オンラインユーザ' 機能は、オーバーヘッドが最小になるようにデフォルトでオンになっています。この機能が不要なら、設定ファイルの SS.config.users.online.enabled の値に false を設定してください。


### Pub/Sub をもっと知る

前述した SS.publish.user() メソッドに加えて、ユーザにまとめてメッセージを送る方法が二つあります。

全ユーザに通知するには（例えば、サーバーメンテナンスによるシステムダウンを全員に通知する場合）、broadcast() メソッドを使います。

``` coffee-script
SS.publish.broadcast('flash', {type: 'notification', message: 'お知らせ: サービスは10分間ご利用できません。'})
```

複数の部屋があるチャットアプリで、特定の部屋だけにメッセージを通知したいこともあるでしょう。まさにそのための機能としてプライベートチャンネルがあり、複数のサーバに対して最小のオーバーヘッドで通知できます。

シンタックスは先ほど紹介したメソッドと似ています。チャンネル名（もしくはチャンネル名の配列）を第一引数に与えてください。

``` coffee-script
SS.publish.channel(['disney', 'kids'], 'newMessage', {from: 'mickymouse', message: 'Tom をどこかで見なかったかい？'})
```

ユーザはチャンネルを無制限に登録できます（/app/server 配下でのみ動作します）。

``` coffee-script
    @getSession (session) ->

      session.channel.subscribe('disney')        # 注釈: 配列も渡せます

      session.channel.unsubscribe('kids')        # 注釈: 配列も渡せます

      session.channel.list()                     # クライアントが登録しているチャンネル一覧を表示
```

指定したチャンネルが存在しない場合、チャンネルは自動的に作成されます。チャンネルの名前には、有効な JavaScript のオブジェクトキーを使えます。もしクライアントが切断して別のサーバのインスタンスへ再接続した場合でも以前のセッションID を保持している限り、同じチャンネルへ再登録されます。これらのメソッドを使うときは、エラーを必ずハンドルしてください。

**注釈**

SocketStream の Pub/Subシステムは、水平方向へのスケーラビリティと高いスループットを念頭においてデザインされました。今後クラスタリングできるようになった時、'broadcast' と 'channel' は複数のSocketStream のインスタンスをまたがって自動的にロードバランシングされるでしょう。

注意すべきことは、送ったメッセージは保存されずログにも残らないことです。もしクライアントがオフラインだと、メッセージはキューに残ることなく失われます。もしリアルタイムなチャットアプリをつくるなら、メッセージを送る前にデータベースかメッセージングサーバに格納することをオススメします。


### HTTP API

HTTP APIは、サーバサイドの全アクションを、おなじみの HTTP/HTTPSリクエストベースのインタフェースでアクセスできるようにします。

HTTP APIはデフォルトで有効になっており、下記のコンフィグ変数で変更できます。

``` coffee-script
SS.config.api.enabled            Boolean       default: true         # HTTP API の有効／無効
SS.config.api.prefix             String        default: 'api'        # URLプリフィックス 例: 左記だと http://mysite.com/api
```

HTTP API はBasic認証もサポートしており、認証後、session.user_id を使うメソッドにアクセスできるようになります。このオプションを使いたい場合、SS.config.api.https_only に true を設定してパスワードが平文のまま送信されないようにすることをオススメします。

'exports.authenticate = true' （上記を参照）を設定することで、そのファイル内のアクションにアクセスする前にサーバがユーザ名とパスワードを要求するようになります。一方 HTTP API では、認証でどのモジュールを使うのかを設定しなくてはいけません。設定ファイルで SS.config.api.auth.basic.module_name 変数に値を入れてください。

``` coffee-script
exports.config =
  api:
    auth:
      basic:
        module_name: "custom_auth"
```

注釈: Basic認証は 'username' と 'password' パラメータを exports.authenticate() 関数に渡します。


### 回線切断時のハンドリング

websocket／'flashsocket'トンネルは障害がおきても驚くほどすぐに回復します。ですが開発者は接続が失敗する可能性をつねに考えなければいけません。特にモバイル機器の回線は不安定です。

**クライアントサイド**

SocketStream のクライアントで利用できる（Socket.IO の機能です） 'disconnect'・'connect' イベントに関数をバインドすることをオススメします。例えば次のようにやります。

``` coffee-script
SS.socket.on('disconnect', -> alert('コネクションが切断されました。'))

SS.socket.on('connect', -> alert('コネクションが確立しました'))
```

オンライン／オフラインのアイコンを切り替えたり、よりよい方法としてはスクリーンを暗くして '再接続中です...' とメッセージを表示したりすることに活用できます。

**サーバーサイド**

SocketStream は（ブラウザのタブが閉じた等で）クライアントが切断されたことを自動的に検知します。その際にユーザをログアウトしたり、データベースをクリーンしたり、メッセージのブロードキャストをしたいでしょう。そんなときは、ユーザがアプリに初めて接続するときに実行される SS.server.app.init() メソッドに次のようなイベントハンドラを登録するとよいでしょう。

``` coffee-script
exports.actions =

  init: (cb) ->
    @getSession (session) ->
      session.on 'disconnect', (disconnected_session) ->
        console.log "ユーザID #{disconnected_session.user_id} はログアウトしました！"
        disconnected_session.user.logout()
```

**注釈**

オフライン時にサーバへリクエストを送ろうとした場合、リクエストはブラウザ内にキューイングされ、再接続したときに自動的に実行されます。近いうちに、株取引アプリなどで必要になるであろう1秒を争うようなリクエストにはマークを付けられるようにする予定です。


### カスタムHTTPハンドラ／ミドルウェアの使い方

私たちはこのアイデアをまだ探求し尽くせていませんが、現在、すべてのHTTPリクエストをミドルウェアへ送ることができます。これによってリクエストオブジェクトを変更したり、さらには、URL・ユーザエージェント・リクエストパラメータに応じてヘッダとコンテンツを独自に処理することさえできます。

これはとても強力な機能です。HTTPリクエストがきた時に Node.js によって最初に呼びだされるため、ものすごく柔軟で無駄のない Node.jsアプリをつくれます。

この機能を使うときは /config/http.coffee に書かれているコメントを見てください。ミドルウェアの例として、下記の my_middleware.coffee というファイルを /lib/server 配下につくって試してください。

``` coffee-script
exports.call = (request, response, next) ->

  # Log the User Agent of each incoming request
  console.log 'ユーザエージェント: ', request.headers['user-agent']

  # All middleware must end with next() unless response is being served/terminated here
  next()
```

### 互換性のないブラウザ

SocketStream がすべてのブラウザにリアルタイムでコンテンツを送るときはデフォルトで websocket を使おうとし、websocket が利用できなければ 'flashsocket' を使います。

flashsocket はオーバーヘッドが大きく最初の接続時にレイテンシがあるため、リアルタイムのやり取りには向いていません。そのため Strictモードを有効にしたくなるかもしれません。

``` coffee-script
SS.config.browser_check.strict = true
```

上記のようにオプションをセットすると、ネイティブな websocket をサポートしているブラウザ（現在サポートしているのは Chrome 4以降と Safari 5以降）のみがアプリと通信できるようになります。それ以外のブラウザでアクセスした場合、/static/incompatible_browsers/index.html の内容が表示されます。このファイルは自由に変更できます。

今後は互換ブラウザを検出するテストの精度を向上させ、安全対策として SocketStreamクライアントの Flashサポートを改良する予定です。

注釈: HTTP APIリクエストの際は SS.config.browser_check.strict の値にかかわらず互換性チェックは行われません。

### セキュリティ

正直なところ、SocketStream がどれくらいセキュアなのか私たちは把握していません。Node.js から SocketStreamクライアントにいたるワンセットはすべて目新しいものばかりなので、リリース可能なちゃんとしたソフトウェアを開発できるように改善している段階です。このような状態なので、SocketStream はファイアウォールで保護して運用することをオススメします。

もしあなたが好奇心に満ちあふれているなら、SocketStream 製の Webサイトをぜひ公開してください。私たちも www.socketstream.org に公開する予定です。ただし、重要なデータはサーバに置かないようにし、なにかあった場合はすぐ復元できるようにしておきましょう。

ソースコードを読んでいて脆弱性を見つけたり、セキュリティホールになりかねないものに出くわしたら、ぜひ私たちにお知らせください。あなたの協力によって、SocketStream 製の Webサイトが安全に公開できる日が近づくでしょう。


__XSS攻撃__

クイックリマインダ: 他のWebフレームワークと同じように、SocketStream は XSS攻撃を受ける可能性があります。悪意を持ってつくられた UGC（User Generated Content）は、ユーザからの入力時（サーバーサイド）とスクリーンへの出力時（クライアントサイド）でフィルタリングすることをオススメします。将来は 'ヘルパー' にフィルタリング機能を実装する予定です。

whileループで 'SS.server' のメソッドをひたすら呼びつづけるコードを、ユーザが投稿するリンクの最後に埋め込むのはとても簡単です。そんなものが実行されてしまったときにはとても「素敵」なことになるでしょう…。


__レート制限と DDOSプロテクト__

SocketStream は DDOS攻撃へのプロテクト機能を持っており、特定クライアントの毎秒15回をこえる websocket の接続を検知することで実現しています（回数は SS.config.limiter.websockets.rps で設定できます）。

毎秒15回をこえる接続をされると対象のクライアントがコンソールに表示され、そのクライアントからの全ての連続したリクエストは無視されます。この機能は実験段階でテスト中のため現在はオフになっていますが、SS.config.limiter.enabled に true をセットすると有効にできます。


### HTTPS／TLS（SSL）

上記のセキュリティのセクションを読んで SocketStreamアプリを（VPNの内側ではなく）インターネットに公開するのなら、HTTPS は「あったらいいのになぁ」という程度のものではありません。必須ですね。

理由は二つあります。

1. 携帯の通信会社がよく使う HTTPプロキシーはリクエストを改変します。それによって websocket の初期化はたびたび妨げられます。そこで HTTPS/TLS を使うことで通信の内容だけでなくヘッダも暗号化されるので、3G回線上のモバイルSafari（iPad や iPhone）からでも websocket がちゃんと動くようになるでしょう。

2. [FireSheep](http://en.wikipedia.org/wiki/Firesheep) をご存知ですか？　セッションハイジャックの問題は、インターネット上に公開する SocketStreamアプリのデフォルトを HTTPS にすることでケリをつけましょう。

SocketStream で HTTPS は簡単につかえます。./configure を実行して、OpenSSL サポート付きの Node.js をコンパイルするだけです。もし OpenSSL ライブラリのインストールがまだなら次のコマンドでインストールできます（Ubuntuの場合）

    sudo apt-get install libssl-dev openssl （ヒント: 実行後に pkg-config をインストール／起動が必要かもしれません）

Node が HTTPS/TLS をサポートするようにさせたら、stating または production 環境で SS.config.https.enabled = true と設定することで HTTPS/TLS を有効にできます。SocketStream はデフォルトで HTTPSサーバーを 443番ポートで立ち上げようとするため、起動には 'sudo'コマンドが必要になるでしょう。

認証されたSSL証明書が見つからない場合は SocketStream に付属する自己署名証明書がデフォルトでロードされます。テストやデバッグには役立ちますが、自己署名証明書をサポートしていないブラウザで websocket を使うときには問題が発生するかもしれません。


**デプロイ**

アプリを公開する準備ができたら、認証済みの SSL証明書が必要になるでしょう。私たちは [www.rapidssl.com](www.rapidssl.com) が気に入っています。他の名だたるプロバイダがやっていないモバイルバージョンの Safari（iPad と iPhone）をサポートしているからです。

SSL証明書を申請するにはプロジェクトのルートディレクトリで下記のコマンドを実行してください。

    cd config/ssl_certs

    openssl genrsa -out site.key.pem 2048

    openssl req -new -key site.key.pem -out site.request.csr

注釈: Common Name は注意して入力してください。Common Name は、あなたの Webサイトのフルドメイン（www.を含む）でなければいけません。

site.request.csr ファイルを認証局に送ると証明書が手に入ります。その証明書を /config/ssl_certs/site.cert.pem に配置してください。また、すべてのブラウザでただしく検証できるように '中間証明書' を /config/ssl_certs/site.ca.pem に配置してください。

それらのファイルがすべて揃うと SocketStream は自己署名証明書のかわりに認証された証明書を使うようになり、サーバの起動時にコンソールへ通知されます。


**strayリクエストのリダイレクト**

HTTPS が使えるようになってからは、証明書に記載されている 'Common Name'（'www.' を含むフルドメイン）にサイト訪問者がアクセスできるようにしなければなりませんね。SS.config.https.domain にサイトのFQDN（例: www.yourdomain.com ）を設定することで、SocketStream は http://yourdomain.com へのリクエストを https://www.yourdomain.com へ自動的にリダイレクトします。これによって訪問者は残念なセキュリティ警告を見ずに済みます。

デフォルトではさらにセカンダリHTTPサーバーを80番ポートで立ち上げ、APIからではない http:// へのリクエストを https:// へ転送します。リダイレクトが不要ならオフにできます（SS.config.http を参照）。


**複数の証明書を使いわける**

複数の証明書を使いわけたいなら /config/ssl_certs にそれぞれを配置し、SS.config.https_cert_name を設定することで SocketStream が使う証明書を指定できます。
デフォルトではこの値は 'site' になっています。そのため前述した説明ではファイル名を site.key.pem と site.cert_pem にしていました。


### スケールアップ

バックエンドで動くプロセスの負荷の量や HTTPSを有効にしているかどうかにもよりますが、一つの SocketStream インスタンスで数千の同時接続をラクにさばけるはずです。しかし、あなたのアプリがものすごく人気になって、一つのサーバでは不十分になった時はどうすればよいのでしょう？

この問題を解決するためにバージョン0.2.0 として現在開発中です。数週間以内にリリースされる予定のアルファリリースをチェックしてください。0.2.0 のほとんどの部分は 0.1.x と API の互換性があるため、既存のアプリが壊れることはないでしょう。


### SocketStream 自体のテスト

SocketStream 自体のテストが十分とはいえず、よくない状態です。私たちがほんとうに良いと考えるテスティングフレームワークを選ぶためにそれぞれの評価をしている最中です。何年にもまたぐ開発という長旅を共にするので慎重に選択しています。フレームワークが決まり次第、変更の可能性が低い部分からユニットテストとインテグレーションテストを書き始める予定です。テストに関してご協力をいただけるととても嬉しいです。


### 既知の問題

* /lib/client に追加した新しいファイルを反映させるには、サーバを再起動して /lib/client 内のファイルのどれかを変更しなければなりません。近日修正する予定です。
* jQuery の $('body') への操作（例: $('body').hide）を Firefox4 でやると flashsocket コネクションが切断されます。私たちがこの奇妙なバグの原因が分かるまで、$('body') の呼び出しは避けたほうがよいでしょう。


### FAQ

Q: SocketStream は Java／Erlang／PHP／Ruby／Python／わたしが気に入ってる言語 のうち、どれかサポートする予定はありますか？

A: いいえ。SocketStream は、つかう技術が慎重に選ばれているスタンドアロンのフレームワークです。だからといって既存のアプリ全体を SocketStream で書き直すよりも、サーバサイドから簡単に呼び出せるレガシーな Webサービスのフロントエンドとして使うことを検討しましょう。


Q: 既存のアプリの中に SocketStream アプリを組み込むことはできますか？

A: いいえ。少なくとも同じホストとポートは使えません。'ハイブリッド' なリアルタイムアプリを開発するなら [Pusher](http://www.pusher.com) を使うことをオススメします。


Q: 同じポートで複数の SocketStream Webサイトを動かせますか？

A: 現在はできません。リバースプロキシをつかったサポートを検討しています。


Q: 複数の CPUコアやサーバによって、巨大な Webサイトをスケールアウトできますか？

A: 現在はできませんが、近日公開予定のバージョン0.2.0 でできるようになります。


Q: アプリはどうテストすればいいですか？

A: Node.js 用のテスティングフレームワークをオススメします。SocketStream に適しているテスティングフレームワークがあればぜひ教えてください。SocketStream にデフォルトのテスティングフレームワークを組み込む予定ですが、それは私たちにとってまったく新しい試みになるでしょう。2011年末頃のアナウンスをお見逃しなく。


Q: SocketStreamアプリを Heroku にデプロイできますか？

A: まだ Heroku は websocket に対応していません。将来 SocketStream/websocket のアプリに対応したホスティングサービスが立ち上がると確信しています。サービスができた時はここに通知する予定です。


Q: モデルはどうやってつくりますか？

A: サーバーサイドのモデルをつくる方法は現在ありません。モデルがつくれなくても、リアルタイムチャットのようなアプリの開発には支障はないかもしれません。しかし CRUDを多用するアプリでは不便でしょう。リアルタイムモデルという素晴らしいソリューションがあるのですが、現在私たちはテストとアイデアのブラッシュアップを繰り返しています。近いうちにお見せできるでしょう。


Q: API／ディレクトリ構造／設定ファイルの形式は将来変わりますか？

A: はい。SocketStream はただ単に新しい Webフレームワークというわけではありません。Webアプリケーションのまったく新しい開発方法を提案します。そのため、この1年で新しいアイデアが取り込まれていき、1.0.0 がリリースされるまではどんどん変更されていくでしょう。変更の過程で、開発者を巻き込むくらい大きな変更をすると思います。自動アップグレードをするためのスクリプトを提供するかもしれません。ベストな方法は HISTORYファイルをチェックし続け、わからないことをオンラインで聞くときはバージョン番号をそえることです。


Q: SocketStream のオフィシャルサイトは公開されますか？

A: もちろん！　現在作成中で www.socketstream.org に公開予定です :)


Q: websocket は Opera で動作しますか？

A: websocket はサポートされていますが、デフォルトでは無効になっています。Opera 11 で websocket を有効にするには "opera:config#Enable%20WebSockets" とアドレス欄に入力し、"Enable websockets" にチェックをつけて設定を保存してください。そうすれば websocket が有効になります。

### コアチーム

* Owen Barnes (socketstream & owenb)
* Paul Jensen (paulbjensen)
* Alan Milford (alz)
* Addy Osmani (addyosmani)


### コントリビューション

私たちは「Web の可能性の再定義」を目標にかかげており、熱心で先を見通せるハッカーを歓迎します。大胆で、夢のようなアイデア、既存のフレームワークや考えかたに縛られない意見がありましたらぜひお教えください。優秀な開発者は 10行のコードを、まったく新しい設計で 3行にしてしまいます。もしあなたがそんな人なら、ぜひコアメンバーとして共に開発しましょう。テストを書いてくれる人や美しいドキュメントを書いてくれる人も歓迎しますし、スピーディにうつりかわる SocketStream をウォッチし続けるためのサポートをさせていただきます。

新機能を SocketStream に追加して pullリクエストを送る前に、私たちのコンセプトである「ムダなく、頑丈で、ものすごく速い」ことに違わないかを確認してください。コアでない機能は NPMモジュールとして提供されるべきです。私たちは NPMモジュールによる機能提供をよりやりやすくする予定です。

アイデアを議論したかったり、何かお話したいことがあれば info@socketstream.org 宛にメールをお送りください。


### クレジット

Guillermo Rauch（Socket.IO）、TJ Holowaychuk（Stylus, Jade）、Jeremy Ashkenas（CoffeeScript）、Mihai Bazon（UglifyJS）、Isaac Schlueter（NPM）、Salvatore Sanfilippo（Redis）、そして SocketStream をよりよいものにしてくれた沢山の方々の素晴らしい活動に感謝します。違うアプローチで取り組むことにインスピレーションをくれた Ryan Dahl（node.js の開発者）には特別な感謝を送ります。


### 謝辞

SocketStream の開発は AOL に支援されています。


### ライセンス

SocketStream は MITライセンスでリリースされています。
