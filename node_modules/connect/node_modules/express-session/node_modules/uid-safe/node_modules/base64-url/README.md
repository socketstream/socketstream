# base64-url

Base64 encode, decode, escape and unescape for URL applications.

<a href="https://nodei.co/npm/base64-url/"><img src="https://nodei.co/npm/base64-url.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/base64-url.png?branch=master)](https://travis-ci.org/joaquimserafim/base64-url)


**V1.1**

**code coverage:**  
`npm test && npm run check-coverage && npm run coverage`

**code-style:**  
`npm run code-style`

**jshint:**     
`npm run jshint`


####API
    
	> base64url.encode('Node.js is awesome.');
	Tm9kZS5qcyBpcyBhd2Vzb21lLg

	> base64url.decode('Tm9kZS5qcyBpcyBhd2Vzb21lLg');
	Node.js is awesome.
 
	> base64url.escape('This+is/goingto+escape==');
	This-is_goingto-escape
  	
    > base64url.unescape('This-is_goingto-escape');
    This+is/goingto+escape==
  	
