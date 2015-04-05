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


