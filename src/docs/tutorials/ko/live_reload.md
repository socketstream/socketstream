# 클라이언트 파일의 라이브 리로딩
<!--- 변역 할쑤가 없떵! # Live Reloading of Client Files-->

웹개발자의 일상은 보통 코드를 바꾸고, 브라우져를 리로드하고, 코드를 바꾸고의 연속입니다. 원하는 결과가 나올때 까지는요.
<!--Life as a front-end web developer used to be a continuous cycle of 'change file', 'reload browser', 'change file', etc etc until you got the result you were looking for.-->

소켓스트림은 `client`디랙토리의 파일이 수정되면 자동으로 브라우저를 리로드해서 이 굴래를 깨버렸습니다.
<!--SocketStream breaks this cycle by automatically refreshing the browser whenever you make a change to any file in the `client` directory.-->

이 기능은 특히 CSS나 HTML을 만질때 유용합니다. 그냥 모니터 한편에 텍스트 에디터를 여시고 브라우저를 반대편에 두시고 생산성이 치솓는걸 느끼세요.
<!--This feature is especially useful when tweaking CSS and HTML. Just open up your text editor on one side of the screen, put the browser on the other, and watch your productivity soar.-->

라이브 리로드는 다음 명령이 불리지 않는 이상 자동으로 실행됩니다:
<!--Live Reload is automatically enabled unless you call:-->

    ss.client.packAssets()

보통 이건 `production` 모드에서 하죠?
<!--As you typically would in `production` mode.-->


### 알려진 문제점
<!---### Known issues-->

라이브 리로드는 노드의 `fs.watch()`API 에 포함되어있습니다. 이는 운영체재마다 다르게 작동합니다. 예를들어 리눅스에선  `client` 디랙토리에 파일이 많을 경우 `EMFILE`에러가 나옵니다. 이런 경우 다음 파일을 여시고:
<!--Live Reload is built on Node's `fs.watch()` API which works differently on each operating system. For example, on Linux you'll get an `EMFILE` error if you have many files in your `client` directory. Change this limit with:-->

    sudo vi /etc/sysctl.conf

다음 라인을 추가합니다.
<!--add the following line-->

    fs.inotify.max_user_instances = 200 # 필요하면 더 올리셔도 됩니다.
<!--fs.inotify.max_user_instances = 200 # or higher if needed-->

그리고 다음 명령을 실행
<!--then run-->

    sudo sysctl -p

만약 여전히 원하는 대로 안되면 사용하는 OS와 에러로그로 이슈를 등록해주세요.
<!--If things still don't work as expected, please log an issue and be sure to mention which OS you're using.-->


### 옵션
<!---### Options-->

개발환경이라도 라이브 리로드를 끄고 싶으시면, 다음코드를 `app.js` 에 넣으세요.
<!--To disable Live Reload, even in development mode, put the following in your `app.js` code:-->

    ss.client.set({liveReload: false})

`/client`내에서 라이브 리로드를 할 최상위 디랙토리를 지정하고 싶으시다면 이렇게 하세요.
<!--Alternatively, you may specify the top-level directories within `/client` you wish Live Reload to observe. E.g.:-->
    ss.client.set({liveReload: ['views', 'css'])
