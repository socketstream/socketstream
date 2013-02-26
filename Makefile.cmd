rd /s /q lib
node node_modules\coffee-script\bin\coffee --bare -o lib -c src
copy src\*.js lib
copy src\utils\*.js lib\utils
mkdir lib\websocket\transports
mkdir lib\websocket\transports\engineio
copy src\websocket\transports\engineio\*.js lib\websocket\transports\engineio
mkdir lib\client\system\libs
copy src\client\system\libs\*.js lib\client\system\libs\
copy src\client\system\modules\*.js lib\client\system\modules\
