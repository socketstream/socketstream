<a name="0.5.2"></a>
## [0.5.2](https://github.com/socketstream/socketstream/compare/0.5.1...v0.5.2) (2015-11-15)


### Bug Fixes

* **debug:** debugging info added to session logic ([a57528b](https://github.com/socketstream/socketstream/commit/a57528b))
* **session:** never returned the identified sessionId ([f36181b](https://github.com/socketstream/socketstream/commit/f36181b))
* **websocket** the new listen function correctly loads transport first



<a name="0.5.1"></a>
## [0.5.1](https://github.com/socketstream/socketstream/compare/0.4.5...v0.5.1) (2015-10-28)


### Bug Fixes

* **log:** sockjs logging ([bfa9ce5](https://github.com/socketstream/socketstream/commit/bfa9ce5))
* **rpc:** request wouldn't configure correctly due to bad fs.exists call ([f3e4363](https://github.com/socketstream/socketstream/commit/f3e4363))
* **rpc:** server can start without rpc responders ([4c76116](https://github.com/socketstream/socketstream/commit/4c76116))
* **servePacked:** serve the existing packed assets in either production configs ([c1fc962](https://github.com/socketstream/socketstream/commit/c1fc962))
* **styling:** the default app would have background cropped with small browser window ([b5d478e](https://github.com/socketstream/socketstream/commit/b5d478e))

### Features

* **middleware:** replaced with session middleware and cached middleware performing the two parts  ([9da5e2d](https://github.com/socketstream/socketstream/commit/9da5e2d))
* **autoload** API auto load for ws.listen and http.middleware access (a7eb4bc2e)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/socketstream/socketstream/compare/0.4.5...v0.5.0) (2015-10-28)


### Bug Fixes

* **log:** sockjs logging ([bfa9ce5](https://github.com/socketstream/socketstream/commit/bfa9ce5))
* **rpc:** request wouldn't configure correctly due to bad fs.exists call ([f3e4363](https://github.com/socketstream/socketstream/commit/f3e4363))
* **rpc:** server can start without rpc responders ([4c76116](https://github.com/socketstream/socketstream/commit/4c76116))
* **servePacked:** serve the existing packed assets in either production configs ([c1fc962](https://github.com/socketstream/socketstream/commit/c1fc962))
* **styling:** the default app would have background cropped with small browser window ([b5d478e](https://github.com/socketstream/socketstream/commit/b5d478e))

### Features

* **middleware:** replaced with session middleware and cached middleware performing the two parts  ([9da5e2d](https://github.com/socketstream/socketstream/commit/9da5e2d))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/socketstream/socketstream/compare/0.4.3...v0.4.4) (2015-09-27)


### Bug Fixes

* **logging:** no warnings by Uglify ([2fd3fbd](https://github.com/socketstream/socketstream/commit/2fd3fbd))
* **pack:** identify previous assets ([a11f584](https://github.com/socketstream/socketstream/commit/a11f584))
* **paths:** relative paths outside client ([64aa4ce](https://github.com/socketstream/socketstream/commit/64aa4ce))
* **start:** transport started when HTTP server started ([159e8d5](https://github.com/socketstream/socketstream/commit/159e8d5))
* **tests:** pack tests disabled for now ([6070de8](https://github.com/socketstream/socketstream/commit/6070de8))
* **tests:** quick-test doesn't rely on git ([47d1be4](https://github.com/socketstream/socketstream/commit/47d1be4))
* **uglify:** stick with uglify-js which is the one that stays updated ([05c369e](https://github.com/socketstream/socketstream/commit/05c369e))
* **windows:** handling * in asset definitions better ([23a9a0d](https://github.com/socketstream/socketstream/commit/23a9a0d))
* **windows:** proper windows separator replacement ([08bea73](https://github.com/socketstream/socketstream/commit/08bea73))

### Features

* **orchestration:** internal draft for load-time assets building tasks ([1e62af3](https://github.com/socketstream/socketstream/commit/1e62af3))
* **orchestrator:** tasks are used internally to start and run ([147b276](https://github.com/socketstream/socketstream/commit/147b276))
* **tasks:** Alternate way to start socketstream without passing server ([62d0dc1](https://github.com/socketstream/socketstream/commit/62d0dc1))
* **tasks:** Task orchestrator is the runtime engine ([c967cb3](https://github.com/socketstream/socketstream/commit/c967cb3))
* **tasks:** default start-server task ([6ee5c34](https://github.com/socketstream/socketstream/commit/6ee5c34))



<a name="0.4.3"></a>
### 0.4.3 (2015-06-14)


#### Bug Fixes

* **bundler:** only include asset type in bundle ([5ef3ed02](https://github.com/socketstream/socketstream/commit/5ef3ed025cbafdad4f621ef6c3b4ab7f56a208db))
* **cli:** Ensures that new apps point to SS 0.4 ([ecd7be27](https://github.com/socketstream/socketstream/commit/ecd7be27a5a615292ba7718b7a4c459cd852d888))
* **templates:** Generate templates with the same IDs as before, and in sub-directories if configured.
* **tests:**
  * Misspelt a path to a file, not caught due to OS X handling mixed case filenames  ([01718001](https://github.com/socketstream/socketstream/commit/01718001527aba26501c9c3bf72e7618a325608c))
  * More tests added, and some unexpected functionality found ([a9c7b54a](https://github.com/socketstream/socketstream/commit/a9c7b54a9b254a5421244d4e20d4c77a9de527e0))
  * Added some tests for the cli, ported from ss-generator ([83b11e8f](https://github.com/socketstream/socketstream/commit/83b11e8f20968af44421028427c75fa5b448b4c2))


<a name="0.4.2"></a>
### 0.4.2 (2015-04-27)


#### Bug Fixes

* **templates:** bug with old template engines getting passed root rather than socketstream api ([19510e35](https://github.com/socketstream/socketstream/commit/19510e350cb7a8e0cf70b749ee8c0b3c5def2d7f))


#### Features

* **bundler:** clarify system module entries loader, libs, start ([4146ec28](https://github.com/socketstream/socketstream/commit/4146ec28c88ced01e019365806df04f31a215d73))
* **pre-commit:** jshint must pass to commit ([34017ff2](https://github.com/socketstream/socketstream/commit/34017ff2ab579ec7c6639df5327b9b476fee08d3))


<a name="0.4.1"></a>
## 0.4.1 (2015-04-21)


#### Bug Fixes

* **dev:** bundler can supply Buffer rather than string for module content ([15e6af75](https://github.com/socketstream/socketstream/commit/15e6af75e7162bdc5d599be59d6d151fc4eeaddd))
* **docs:** prepend and connect3 re #527 ([61b40825](https://github.com/socketstream/socketstream/commit/61b408252ecd00ee73e8d989881271e314cdd27d))
* **merge:** fixed merge mistake ([e3826ed5](https://github.com/socketstream/socketstream/commit/e3826ed5b33c247eb4ce20f281f0d6a5cf9f582d))


#### Features

* **bundler:**
  * ss.bundler.systemModules() returns all ([a1114433](https://github.com/socketstream/socketstream/commit/a111443351a7f07fb0e6c0c7573a405c3fb51f71))
  * revised constructor and define calls of custom bundlers ([1caf28a5](https://github.com/socketstream/socketstream/commit/1caf28a5b852d1fd264b7ecfba13f20360004711))


<a name="0.4.0"></a>
### 0.4.0 (2015-04-12)


#### Bug Fixes

* **browserify:** essential test coverage, and require working for directories ([2a41ea95](https://github.com/socketstream/socketstream/commit/2a41ea95804d52444108955bc1041288ab94aba3))
* **bundler:**
  * assets URL, client ref ([3101bce0](https://github.com/socketstream/socketstream/commit/3101bce0a385579f37844aa36024904a8c8be535))
  * packing initCode ([ecfe64f2](https://github.com/socketstream/socketstream/commit/ecfe64f2287e5eb843087e4caca06a12c46ad593))
  * fix _serveDev typo ([694aa221](https://github.com/socketstream/socketstream/commit/694aa2213819a6ffc47326f5e9bcb2c32c7476ae))
* **client:** http require provides the serveClient API ([1dde4e09](https://github.com/socketstream/socketstream/commit/1dde4e098464a06e4ae4ecda89350398085eeaf2))
* **cookie:** cookie configuration in http strategy ([72d6c631](https://github.com/socketstream/socketstream/commit/72d6c63189fb0f9f3b1a8de4adb29009529ef88d))
* **dev:** get entry for /code/.. not code/.. ([33fba3b9](https://github.com/socketstream/socketstream/commit/33fba3b96ab277d224eb7b057adae84380e9e478))
* **docs:** engine generate ([3482973e](https://github.com/socketstream/socketstream/commit/3482973e2873e03352a0e5c7a6fb616d4e6a4032))
* **error:** Better error ([60883a42](https://github.com/socketstream/socketstream/commit/60883a422dd743fbb7193cdb511673a2f4a3b952))
* **lint:** trying to fix hound comments ([34b5e774](https://github.com/socketstream/socketstream/commit/34b5e7744e87d7741de4253f4f8f987c24cc49c8))
* **packed:** Pack 0 assets ([e0d01833](https://github.com/socketstream/socketstream/commit/e0d018334e968e6a9fdb631661b8e2e384ab1ef2))
* **serve:** serve system module ([91ddaa4d](https://github.com/socketstream/socketstream/commit/91ddaa4d4106b54e8dae3ee14c2fbe32cbea3f7b))
* **tests:**
  * using common abcClient test util ([38154fb6](https://github.com/socketstream/socketstream/commit/38154fb6468086cbaff6dc4b84928e82539347c3))
  * conflicting file names ([6565a9c0](https://github.com/socketstream/socketstream/commit/6565a9c0bd91c44e9169825550a0f59ad6af6d9e))
  * mock ss.publish in tests ([64247faa](https://github.com/socketstream/socketstream/commit/64247faa1f61f57b93fe176940cf9ee4ee42cc6c))
  * wrong paths ([9a1acd10](https://github.com/socketstream/socketstream/commit/9a1acd10087cba07c5936b2a67810b5737ab580f))
  * forgot updates for startInBundle ([080abcaa](https://github.com/socketstream/socketstream/commit/080abcaaa31441af750ffdebba9d91748ea2a0dd))
  * system assets ([79544853](https://github.com/socketstream/socketstream/commit/795448539d9def98185cbc7a9e626eeb01688bb6))
  * send modules ([588cf84c](https://github.com/socketstream/socketstream/commit/588cf84c91bd27ce3abc095b46b26beb135bbf4f))
  * system assets ([148369b6](https://github.com/socketstream/socketstream/commit/148369b63074dc6c825b6622afa95088a21185ea))
* **unload:** unloading functions ([17356a3b](https://github.com/socketstream/socketstream/commit/17356a3ba1a1fdc529c8c0529340b8040f78248e))
* **view:** correct formatter used for view ([5bc2a05d](https://github.com/socketstream/socketstream/commit/5bc2a05db6f5f62ac85b557f1662e69ad5c0796e))
* **worker:** fixed serving worker files ([1a5c91f4](https://github.com/socketstream/socketstream/commit/1a5c91f408712a9ceccbe216cd092a26d2309ef8))
* **wrap:** support system library subdirectories ([669f000a](https://github.com/socketstream/socketstream/commit/669f000ae9bc22df87b1fb8f064f2c4877d8722a))


#### Features

* **assets:**
  * missing file ([0e82774f](https://github.com/socketstream/socketstream/commit/0e82774f443705366e90eb2de04be3b1d835078f))
  * URL scheme for assets ([fc93d394](https://github.com/socketstream/socketstream/commit/fc93d394d4405cdfa57c005dff38eb1ebef42424))
* **entry:** entry point is added to startCode rather than sent with system assets ([aaea0d95](https://github.com/socketstream/socketstream/commit/aaea0d95941489763e60d4d2d65a5a05a6618476))
* **browserify:** browserify in default bundler loader ([fb162bd3](https://github.com/socketstream/socketstream/commit/fb162bd37405f6b4f82f622cb0722d18733bf638))
* **bundler:**
  * bundle vs extension vs assetType ([498d9c86](https://github.com/socketstream/socketstream/commit/498d9c861a0b861a8380ba10b15ed9181eedd470))
  * simple api, module, asset ([cfa3f65e](https://github.com/socketstream/socketstream/commit/cfa3f65e6691de42d38e1de0445dc5d9216b7bb0))
  * entries have extension ([55bbe799](https://github.com/socketstream/socketstream/commit/55bbe79928a5ccbddf56bc0f24eb3bb061668209))
  * better systemModule ([ee1dd954](https://github.com/socketstream/socketstream/commit/ee1dd954b083e131d160952d248ffcfbc4cc8522))
  * pass system.assets to entries ([4999e767](https://github.com/socketstream/socketstream/commit/4999e76725519269790fde3323b1f80d8c95a1a2))
  * system modules are named without JS extensions ([7fd3833c](https://github.com/socketstream/socketstream/commit/7fd3833ceb6fb86ccd8ef83e0f56b38af0b4ed1b))
  * view with tags ([510fb53e](https://github.com/socketstream/socketstream/commit/510fb53e4a53e7be36d4b91282526d0792dfefba))
  * Pack & System Assets serving in bundler ([9b7cb47e](https://github.com/socketstream/socketstream/commit/9b7cb47e30d99dc409328c4e24e17d995655d489))
  * Dropping global-require ([6f0b391b](https://github.com/socketstream/socketstream/commit/6f0b391bd288363a74915a125ce57e6c2881b910))
  * Improved bundler api ([4c4313e6](https://github.com/socketstream/socketstream/commit/4c4313e66f0a500b16baa25d8964cd45ff0dc529))
  * ss.bundler.asset.launch ([e6cb07b9](https://github.com/socketstream/socketstream/commit/e6cb07b9ef511adeed39f39a5f1a8752f97669c2))
  * client.includes needed for now ([94b86e7b](https://github.com/socketstream/socketstream/commit/94b86e7b4750c4d92b62f250b593dbbef5eb74f0))
  * tmpl: '*' ([8788aeec](https://github.com/socketstream/socketstream/commit/8788aeec9aa422b5dc8b620489d8d4ce4c323a94))
  * Assets relative to /client ([06433771](https://github.com/socketstream/socketstream/commit/0643377160faa3748d1ebf0040e55f407a63bee8))
  * Alternate bundler ([f99eb5fe](https://github.com/socketstream/socketstream/commit/f99eb5fead9d4e49dc61f7f532932d5c1542d0db))
  * Manage saved asset files ([ca55b5da](https://github.com/socketstream/socketstream/commit/ca55b5daa4a5ca98718d6ce4df0119af29dc4478))
  * Bundlers have common implementation methods ([aea18d25](https://github.com/socketstream/socketstream/commit/aea18d25e8365532ef48680ba4ef5d5d4879f5af))
  * Use default bundler in the client ([cf7641c4](https://github.com/socketstream/socketstream/commit/cf7641c4ca62a1d34dc2bc8c1d143746f204ab3c))
* **client:** unload and forget calls ([d1beae04](https://github.com/socketstream/socketstream/commit/d1beae0417f232db0fdf2fd2d79b707288c70267))
* **constants:** constants set by bundler ([851dabe0](https://github.com/socketstream/socketstream/commit/851dabe07da39a21dc9ddc6659ac61c946652f76))
* **dev:** dev serve /assets ([a22d5fc6](https://github.com/socketstream/socketstream/commit/a22d5fc6f2ff76b704ca8f34523695f8a8f952c3))
* **entry:** first client module with entry.* ([f5dd8799](https://github.com/socketstream/socketstream/commit/f5dd8799c5d524985ffcdbbcf4b8716821b7d1b9))
* **formatter:** builtin formatters ([ae962a6f](https://github.com/socketstream/socketstream/commit/ae962a6f0027dd9a3a0d41dafa89555b425dea3b))
* **id:** unique client id can be used to look up bundler ([c5adac7e](https://github.com/socketstream/socketstream/commit/c5adac7e0a7c2bade6e826cb79f4c8f746fa2555))
* **loading:** better entry module loading ([5d232018](https://github.com/socketstream/socketstream/commit/5d2320188f90f9d228811f459ef43309f3f2eb9f))
* **locals:** can define locals for client and pass to formatters ([248c1ab2](https://github.com/socketstream/socketstream/commit/248c1ab281b49fa81469cd1c0deddcb7bfe2bda9))
* **log:**
  * log is no longer a function ([be857ae2](https://github.com/socketstream/socketstream/commit/be857ae2be4df25abf71ac69009bf05975fab6cf))
  * Expose logging to formatters ([1c238796](https://github.com/socketstream/socketstream/commit/1c23879649e7001180f42b9fa5bebef7578b64de))
* **logging:** log and serve formatting errors ([21ec301a](https://github.com/socketstream/socketstream/commit/21ec301a95b90b441e35f63034f3ad8ae908c619))
* **shim:** Dropping JSON shim ([bd7ab276](https://github.com/socketstream/socketstream/commit/bd7ab276c0a94884304a42656bae62083a5b0c7e))
* **start:** Start Code at end of view ([19442e69](https://github.com/socketstream/socketstream/commit/19442e694e1d33f3b4ea932650917c4e76a2f887))
* **templates:** selectEngine for relative and absolute paths ([3009f493](https://github.com/socketstream/socketstream/commit/3009f4934b48120998c91ec5be3526337ed44ee7))
* **webpack:** webpack bundler exceptions fixed ([f7ed22a9](https://github.com/socketstream/socketstream/commit/f7ed22a932437a9de8a6bc9c633dbe20c1802add))


#### Compatibility

* **log:** log is no longer a function ([be857ae2](https://github.com/socketstream/socketstream/commit/be857ae2be4df25abf71ac69009bf05975fab6cf))
* The browserify.js require implementation no longer looks for 'node_modules' paths. This feature makes little sense in
the browser, and goes against a principle of simplicity. The require lookup is now small and simple. 1) File 2) Directory 3) System

<a name="0.3.12"></a>
### 0.3.12 (2015-04-05)


#### Bug Fixes

* **cookie:** cookie configuration in http strategy #454 ([8f6c20f0](https://github.com/socketstream/socketstream/commit/8f6c20f0b817c952ea43e16dfe0d2b8bf5b757c3))
* **debugging:** Log stack trace for internal server errors ([ec0f7337](https://github.com/socketstream/socketstream/commit/ec0f7337fff2337d4161694d16fbc172ab76cd78))
* **docs:**
  * Fixed formatting in the docs ([ebd60804](https://github.com/socketstream/socketstream/commit/ebd60804885f1af0f3cedb9d8707effa8a5d816d))
  * Updated docs ([bc0ec325](https://github.com/socketstream/socketstream/commit/bc0ec3253ced75f8d8484ef0983f561044fb61cc))
  * Updated main page and fixed broken links ([f81cddb3](https://github.com/socketstream/socketstream/commit/f81cddb3fa675b84977ef1a0e6388ec1c315eb2d))
* **integrations:** Fixed config for gitter notify ([28543c51](https://github.com/socketstream/socketstream/commit/28543c51b6b5e1d129309b5a128c8ef03bcb5a7a))
* **static:**
  * Static files from static and assets dirs ([f93652e4](https://github.com/socketstream/socketstream/commit/f93652e4b16515d973a95ef59ab68ca6a4aef64c))
  * Views and static paths can coexist without name clashes #470


#### Features

* **modules and libs:**
  * Can be overridden #456
  * Shims are loaded before libs and can be added with the send call. ([d0d0715165](https://github.com/socketstream/socketstream/commit/c0bea3c1c3a8bf43d84bd1176dfccfd0d0715165))
* **http:**
  * Alternate strategies for http middleware ([a25c3d86](https://github.com/socketstream/socketstream/commit/a25c3d8639287c86f962cf758e63d1386423c825))
  * static strategy ([d2037735](https://github.com/socketstream/socketstream/commit/d2037735dbfc6b500af642993d5629e79fbd358c))
* **static:** Support no use of ss.http.middleware ([f2fd0ca0](https://github.com/socketstream/socketstream/commit/f2fd0ca0c2201887ad5e609717f9e416914e90f6))

### Compatibility

* **Node 0.6** is no longer supported
* Upgraded to latest **Connect** version #504
* Upgraded to latest **Engine.io** version #435


<a name="0.3.11"></a>
### 0.3.11 (2014-10-15)


#### Bug Fixes

* Adding travis support back in ([d7d15fbe](https://github.com/socketstream/socketstream/commit/d7d15fbe0c25d54538c2fcf7e528f416e7736aa9))
* **Gruntfile:** names changed for tasks `isGhPagesBranch`, `isClean` ([b5f95803](https://github.com/socketstream/socketstream/commit/b5f9580321422828e77fb51f9e14c1e36a9e790e))
* **TravisCI:** Not testing 0.8 as dependencies no longer support it ([443e4ffa](https://github.com/socketstream/socketstream/commit/443e4ffa98f1fa730966e3f4e59947faa329a0b0))
* **docs:**
  * Added updated docs ([d498c676](https://github.com/socketstream/socketstream/commit/d498c6769e7e26a333c1738bd28674cdc320338a))
  * Added tweaks and styling ([c3ebc02d](https://github.com/socketstream/socketstream/commit/c3ebc02dd45f9fca6a3ff81efefcef4df946cf49))
  * Corrected spelling and updated docs ([8c9a6bc6](https://github.com/socketstream/socketstream/commit/8c9a6bc645173ba12be73dfb6d0ead322e61c966))
* **generator:** updated jade templates - fixes #447 ([d58d2457](https://github.com/socketstream/socketstream/commit/d58d24579d1d0dd85682d1bb5985ae1da63afff7))
* **http:**
  * Fixes and updates ([58898c5c](https://github.com/socketstream/socketstream/commit/58898c5c8879d8fde25798256258bc1587d91a19))
  * Allow setting your own cookie parser secret ([8432e347](https://github.com/socketstream/socketstream/commit/8432e3476f087595d75a57ff03231c563b015a2c))
* **test:** Updated should and made changes to testing setup ([c4e2eb61](https://github.com/socketstream/socketstream/commit/c4e2eb61891a8584e47c72073ade61c9cb4d7036))
* **tests:**
  * Istanbul was injecting listeners that failed a test ([32ab2283](https://github.com/socketstream/socketstream/commit/32ab2283ad78a6ef2c148f97f8b689891569555a))
  * Added coveralls to check the code coverage stats ([db166c1e](https://github.com/socketstream/socketstream/commit/db166c1e19c0822d6c403f6e639391d6940c6cca))
  * Better test running ([033f1787](https://github.com/socketstream/socketstream/commit/033f1787bfa41f113ebdd47e1d9bc59c2495d3ab))
* **travis:** Dropping support for 0.8 ([1f6e3901](https://github.com/socketstream/socketstream/commit/1f6e3901ca12c378c76d91b91b2177f14f16c0da))
* **workflow:** Replacing grunt tasks with node modules ([fedf8ac3](https://github.com/socketstream/socketstream/commit/fedf8ac3a561a02cc032a7f537c1200b9b3905f7))


#### Features

* **Gruntfile:**
  * Add helper task `grunt isGhPagesBranch` ([4afd173e](https://github.com/socketstream/socketstream/commit/4afd173e9a091cd873d415aacfc675da09df9e10))
  * Add task `grunt release:push` ([5fa909f6](https://github.com/socketstream/socketstream/commit/5fa909f63f3bb5f41cc3597b0590b5b2ce2643e6))
  * Add task `grunt isClean:branchName` ([1cfaf107](https://github.com/socketstream/socketstream/commit/1cfaf1073a2d787ee96bff519e1cbc333eddb622))
  * Add task `grunt changelog` ([fa3ebef8](https://github.com/socketstream/socketstream/commit/fa3ebef82cac66c8c41625f131b5c7d7572d1297))
* **lib:** Users can now pass the NODE_ENV to set the environment ([09bb6c0d](https://github.com/socketstream/socketstream/commit/09bb6c0d69fbe4a290d6c6292e590a918ef985ac))
* **utils:** Add `ss.api.log` unified logging API ([5fcd9527](https://github.com/socketstream/socketstream/commit/5fcd952765580e3e7f4cb206e1810028039b2f0a))
