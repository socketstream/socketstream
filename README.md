![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/client/static/images/logo.png)

# SocketStream
[![Build Status](https://api.travis-ci.org/socketstream/socketstream.svg?branch=master)](https://travis-ci.org/socketstream/socketstream) [![Dependency Status](https://david-dm.org/socketstream/socketstream.svg)](https://david-dm.org/socketstream/socketstream#info=dependencies) [![devDependency Status](https://david-dm.org/socketstream/socketstream/dev-status.svg)](https://david-dm.org/socketstream/socketstream#info=devDependencies) [![Code Climate](https://codeclimate.com/github/socketstream/socketstream.svg)](https://codeclimate.com/github/socketstream/socketstream) [![Codacy Badge](https://www.codacy.com/project/badge/802df47157c84beca4c3dbcda76bc553)](https://www.codacy.com/public/paulbjensen_2636/socketstream) [![NPM version](https://badge.fury.io/js/socketstream.svg)](http://badge.fury.io/js/socketstream) [![Gitter chat](https://badges.gitter.im/socketstream.svg)](https://gitter.im/socketstream/socketstream)
[![Issue Stats](http://issuestats.com/github/socketstream/socketstream/badge/pr)](http://issuestats.com/github/socketstream/socketstream)
[![Issue Stats](http://issuestats.com/github/socketstream/socketstream/badge/issue)](http://issuestats.com/github/socketstream/socketstream)
[![Coverage Status](https://img.shields.io/coveralls/socketstream/socketstream.svg)](https://coveralls.io/r/socketstream/socketstream?branch=master)
[![Stories in Ready](https://badge.waffle.io/socketstream/socketstream.png?label=ready&title=Ready)](https://waffle.io/socketstream/socketstream)


### Introduction

SocketStream is a framework for Realtime Web Apps

_Latest release: 0.5.1 unstable ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))_

[Live demo](http://demo.socketstream.com) | [Documentation](http://socketstream.github.io/socketstream/docs/)

For existing SocketStream installations you may want to remain on `0.4.5` for a while. It is the most backwards compatible
and robust and  well covered by tests. It should be ready for production.

The coming releases will see a lot of changes to accommodate new transport options modern browsers and mobile apps. The API
will remain largely the same, but there are bound to be some changes.

### Installation

    npm install -g socketstream

### Usage

    socketstream new <your_app_name>
    cd <your_app_name>
    npm install
    npm start

Then open a web browser at localhost:3000:

    open http://localhost:3000

### Upgrade from 0.3 or 0.4 to 0.5

To make SocketStream more stable some major dependencies have been moved out. Please add these modules to `package.json`.

* socketstream-session: 0.5.0
* engine.io: 1.5.2
* redis: 0.12.1

### Why SocketStream?

The Real-Time web has been touted for years, and it is very much in use. However there remains a number of challenges that have not been solved.
Web Sockets will remain an important technology for delivering a _live_ experience on your website or mobile app. However with HTTP/2 and WebRTC
other options come into play. SocketStream will help you to mix and match depending an what you aim to build.

It give you tools to manage your project:

* Providing a sensible place to put everything
* Accelerating deployment with integrated asset packing and CDN support
* Production Deployment skeleton
* Good debugging output

Integration points:

* Accelerating development with Live Reload and (optional) support for Stylus, Jade, and other transpilers.
* Add-ons can be dropped in without configuration needed picking between Cookie and Token based auth.

Batteries included:

* Dependencies are peer, so you pick the versions you want to use.
* Built-in CommonJS bundler (ES6 on-the-way)
* Built in formatter integration for: Sass, LESS, Stylus, Jade, Hogan
* Built in template engine integration for: HTML5, React, Angular, jQuery
* Built in transport integration for: Socket.io and SockJS
* Examples

Building a simple chat app that uses websockets is easy, but rich, non-trivial, responsive realtime UI without ending up with a mess of code is hard SocketStream eases the pain by:

### Applications using SocketStream

- [Dashku](https://github.com/Anephenix/dashku): Realtime dashboards and widgets using HTML, CSS and JavaScript. Also hosted at [dashku.com](https://dashku.com).
- [SketchDeck](http://sketchdeck.com): An app for designing great slide decks from sketches, also a Y Combinator tech startup.
- [Hollow](http://hollowdocumentary.com/): An interactive, emmy-nominated documentary.
- [Bitjoy](http://bitjoy.org/): Realtime Bitcoin prices and news.
- [Teeleader](http://www.teeleader.com): A booking engine for Golf courses.

### Presentations

- SocketStream (November 2013): On [Slideshare](http://www.slideshare.net/paulbjensen/socketstream-28194445) and [SpeakerDeck](https://speakerdeck.com/paulbjensen/socketstream).

### Videos

(most recent at end)

* [KrtConf.com, Portland, November 2011](http://2011.krtconf.com/videos/owen_barnes)
* [LNUG.org, London, May 2012](http://vimeo.com/43027679)
* [LXJS, Lisbon, September 2012](http://www.youtube.com/watch?v=LOS1lpWXphs)
* [RealtimeConf, Portland, October 2012](http://2012.realtimeconf.com/video/owen-barnes)
* [QCon, San Francisco, November 2012](http://www.infoq.com/presentations/SocketStream)
* [RealtimeConf EU, Lyon, April 2013](https://www.youtube.com/watch?v=76ZSp3OtCTM)

### Documentation

Checkout the [documentation here](http://socketstream.github.io/socketstream/docs/#/tutorials).


### Team

*Owner:* Henrik Vendelbo

*Original Creator:* Owen Barnes

*Core Contributors:*

- Paul Jensen
- Roman Minkin
- Robert Hall
- Joshua Cullick

### Contact

- Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
- Chat: [Gitter](https://gitter.im/socketstream/socketstream)

### License

SocketStream is released under the MIT license.
