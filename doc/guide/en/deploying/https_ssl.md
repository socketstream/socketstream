### HTTPS / TLS (SSL)

If you've read the Security section above and decided to deploy a SocketStream app on the edge of the Internet (rather than inside a corporate VPN), HTTPS is not a nice-to-have feature, it's essential.

The reason is two-fold:

1. HTTP proxies, in particular those used by mobile telcos, mangle the headers of each outgoing HTTP request. This often prevent websockets from initializing correctly. HTTPS/TLS not only encrypts your content, but also the HTTP headers - allowing websockets to work as expected, even in Mobile Safari (iPad and iPhone) over a 3G connection.

2. Do you remember [FireSheep](http://en.wikipedia.org/wiki/Firesheep)? Let's stop this problem once and for all by making HTTPS the default when deploying SocketStream apps on the Internet.

The good news is SocketStream makes HTTPS easy. You just need to make sure you've ./configure'ed and compiled Node.js with OpenSSL support. If you don't have the OpenSSL library headers already you can install them on Ubuntu with:

    sudo apt-get install libssl-dev openssl  (Hint: You may need to install/run pkg-config after doing this)

Once Node supports HTTPS/TLS, enable it in SocketStream with `SS.config.https.enabled = true` in your staging or production environment. By default SocketStream will want to launch the HTTPS server on port 443, so you'll need to run it with 'sudo'.

SocketStream comes with a set of self-signed SSL certificates which are loaded by default if commercial certificates cannot be found. This can be useful for testing/debugging your app; however, you may run into problems with certain browsers which don't support self-signed certificates + websockets together.


#### Deploying

When you're ready to go live you'll need to get a proper commercially-signed SSL certificate. We like the SSL certs from [www.rapidssl.com](www.rapidssl.com) because they support the Mobile version of Safari (iPad and iPhone) which some other popular providers do not.

To obtain a commercial SSL certificate run the following in your project's root directory:

    cd config/ssl_certs

    openssl genrsa -out site.key.pem 2048
    
    openssl req -new -key site.key.pem -out site.request.csr
    
Note: Pay particular attention when entering the Common Name. This should be the full domain (including the www.) of your website.
    
Send the contents of the site.request.csr file to your certificate provider. In exchange you'll receive a certificate which should be installed as /config/ssl_certs/site.cert.pem  You should also receive an 'Intermediate Certificate' which ensures the certificate is recognised by all browsers. Place this in /config/ssl_certs/site.ca.pem

Once all files are present SocketStream will use this certificate instead of the self-signed test certificates and indicate this in the console upon starting the server.


#### Redirecting stray requests

Once HTTPS is enabled it's very important your visitors go to the domain listed as the 'Common Name' in the certificate - typically the 'www.' version of your website. By setting `SS.config.https.domain` to the FQDN of your website (e.g. www.yourdomain.com), SocketStream will automatically redirect any requests sent to https://yourdomain.com to https://www.yourdomain.com so your visitors never get bugged with nasty security warnings.

What's more, by default, we also launch a secondary HTTP server on Port 80 to re-direct any non-API traffic sent to http:// to https://. Both options can be turned off if desired (inspect `SS.config.https` to see variables).


#### Using multiple certificates

Finally, you may install multiple SSL certificates in /config/ssl_certs and select the ones you would like SocketStream to use with `SS.config.https.cert_name`. By default this is set to 'site', hence site.key.pem, site.cert.pem.