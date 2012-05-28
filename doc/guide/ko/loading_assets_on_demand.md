<!---# Loading Assets On Demand-->
# �ʿ��Ҷ��� Assets�� �ҷ�����


<!--If you're writing a small app you can safely ignore this section, as it's always better to pack all client assets into one file and send everything through together in one go if possible.-->

����� �ִ� ���� �۴ٸ�, �� �κ��� �ǳʶپ �˴ϴ�. �ֳ��ϸ� �����ϸ�, Ŭ���̾�Ʈ�� ���� �� ���Ͽ��ٰ� ��Ƴ���, �� ���� ��� ������ ���� ���� �����Դϴ�.

<!--But what if you're writing a large app, or an app with multiple distinct sections like iCloud.com?-->
�׷��� ����� �ִ� ���� ũ�ų�, ���� �����Ǵ� ���� ���� ������ ������ ��쿡�� ����? ���� ��� iCloud.com�� ���ó����.

<!--SocketStream allows you to load code (and other assets in the future) into your app asynchronously on demand.-->
���Ͻ�Ʈ�������� ��û�� ���� ������ �񵿱����� ������� �ڵ带 �ۿ��ٰ� �ε��� �� �ֽ��ϴ�. ���߿��� �ٸ� ���µ� �̷��� �� �� ���� ���Դϴ�.


<!---### Loading Code-->
### �ڵ带 �ε��ϱ�

<!--Sadly it's not possible to directly `require()` modules which haven't been loaded as the blocking nature of the `require` function means the browser would freeze until the module has been retrieved from the server - not good.-->

��Ÿ���Ե�, �ε�Ǿ� ���� ���� ����� ���� `require()`�� ���� �����ϴ�. `require` �Լ��� �����κ��� ����� ������ ������ �������� ����ϴ�.

<!--However SocketStream allows you to load additional code modules from the server asynchronously using the built-in `ss.load.code()` command. Once all the code you've requested has been loaded, we execute a callback, allowing you to `require()` the new modules as normal without any fancy syntax.-->

������ ���Ͻ�Ʈ�������� `ss.load.code()` ��ɾ ����ؼ�, �񵿱������� �������� �߰����� �ڵ� ����� �ε��� �� �ֽ��ϴ�. �ϴ� �������� ��û�Ͻ� �ڵ尡 �� �ε�Ǹ�, ���Ͻ�Ʈ�������� �ݹ��� �����մϴ�. �׷��� Ư���� ������ ���� �ʾƵ�, `require()`�� ����ؼ� ���ο� ����� �ε��� �� �ֽ��ϴ�.

<!--To try this out, create a new directory of application modules in `/client/code`. For the sake of this example, let's call our new directory `/client/code/mail`. We'll also assume this directory has a module in it called `search.js`.-->
���� �غ�����. ���ø����̼� ��⿡ ����� ���ο� ������ `/client/code` ������ ���弼��. �׸��� ���ο� ������ `/client/code/mail`�̶�� �̸��� ���̼���. �� ���� �ȿ��� `search.js`��� ����� �ִٰ� �����ϰڽ��ϴ�.
```javascript
//Ŭ���̾�Ʈ���� ���
ss.load.code('/mail', function(){

  // /client/code/mail �ȿ� ����ִ� ����� ��� �ε�Ǿ����ϴ�.
  // ��Ʈ�� ���ӽ����̽��� (/)(??)�� ������ ������� ��û�� �� �ֽ��ϴ�.

  var search = require('/search');

});
```
<!--  // all modules in /client/code/mail have now been loaded into-->
<!--  // the root namespace (/) and can be required in the normal way-->
<!--// in any client-side module-->



<!--Note: Regardless of the directory you load, the modules inside will always be loaded into the root (/) namespace by default. If you want to mount the new modules in a different namespace, just create one or more sub-directories in the folder you're loading.-->

�����ϼ���: �������� �ε��ϴ� ������ �������, ���� �ȿ� �ִ� ����� ������ ������ ������ �׻� ��Ʈ (/) �ȿ� �ε�� ���Դϴ�. ���ο� ����� �ٸ� ���ӽ����̽� �ȿ� ����Ʈ�Ͻ÷��� �ε��Ͻ÷��� ������ �ϳ� ����ų�, �ε��ϴ� ���� �ȿ� ���� ������ �ϳ� ���弼��.


<!---### Automatic Caching-->
### �ڵ� ĳ��

<!--Modules are only ever retrieved from the server once. Subsequent requests for the same directory will be returned instantly without contacting the server.-->
����� �����κ��� �� ���� �����ɴϴ�. ������ ������ ���� �� ���Ŀ� �̷������ ��û�� ������ �������� �ʰ� �ٷ� ��ȯ�˴ϴ�.
