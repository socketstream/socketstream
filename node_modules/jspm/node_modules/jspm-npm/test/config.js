System.config({
  "paths": {
    "*": "*.js",
    "app/*": "lib/*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "assert": "github:jspm/nodelibs-assert@0.1.0",
    "buffer": "github:jspm/nodelibs-buffer@0.1.0",
    "child_process": "github:jspm/nodelibs-child_process@0.1.0",
    "cluster": "github:jspm/nodelibs-cluster@0.1.0",
    "console": "github:jspm/nodelibs-console@0.1.0",
    "constants": "github:jspm/nodelibs-constants@0.1.0",
    "crypto": "github:jspm/nodelibs-crypto@0.1.0",
    "dgram": "github:jspm/nodelibs-dgram@0.1.0",
    "dns": "github:jspm/nodelibs-dns@0.1.0",
    "domain": "github:jspm/nodelibs-domain@0.1.0",
    "events": "github:jspm/nodelibs-events@0.1.0",
    "http": "github:jspm/nodelibs-http@1.7.0",
    "https": "github:jspm/nodelibs-https@0.1.0",
    "net": "github:jspm/nodelibs-net@0.1.0",
    "os": "github:jspm/nodelibs-os@0.1.0",
    "path": "github:jspm/nodelibs-path@0.1.0",
    "process": "github:jspm/nodelibs-process@0.1.0",
    "punycode": "github:jspm/nodelibs-punycode@0.1.0",
    "querystring": "github:jspm/nodelibs-querystring@0.1.0",
    "readline": "github:jspm/nodelibs-readline@0.1.0",
    "repl": "github:jspm/nodelibs-repl@0.1.0",
    "stream": "github:jspm/nodelibs-stream@0.1.0",
    "string_decoder": "github:jspm/nodelibs-string_decoder@0.1.0",
    "timers": "github:jspm/nodelibs-timers@0.1.0",
    "tls": "github:jspm/nodelibs-tls@0.1.0",
    "tty": "github:jspm/nodelibs-tty@0.1.0",
    "url": "github:jspm/nodelibs-url@0.1.0",
    "util": "github:jspm/nodelibs-util@0.1.0",
    "vm": "github:jspm/nodelibs-vm@0.1.0",
    "zlib": "github:jspm/nodelibs-zlib@0.1.0",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.0.1"
    },
    "github:jspm/nodelibs-console@0.1.0": {
      "console-browserify": "npm:console-browserify@1.1.0"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-crypto@0.1.0": {
      "crypto-browserify": "npm:crypto-browserify@3.9.6"
    },
    "github:jspm/nodelibs-dgram@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-dns@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-domain@0.1.0": {
      "domain-browser": "npm:domain-browser@1.1.3"
    },
    "github:jspm/nodelibs-events@0.1.0": {
      "events-browserify": "npm:events-browserify@0.0.1"
    },
    "github:jspm/nodelibs-fs@0.1.0": {
      "assert": "npm:assert@1.3.0",
      "fs": "github:jspm/nodelibs-fs@0.1.0"
    },
    "github:jspm/nodelibs-http@1.7.0": {
      "Base64": "npm:Base64@0.2.1",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "url": "github:jspm/nodelibs-url@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "github:jspm/nodelibs-https@0.1.0": {
      "https-browserify": "npm:https-browserify@0.0.0"
    },
    "github:jspm/nodelibs-net@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-os@0.1.0": {
      "os-browserify": "npm:os-browserify@0.1.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.0": {
      "process": "npm:process@0.10.0"
    },
    "github:jspm/nodelibs-punycode@0.1.0": {
      "punycode": "npm:punycode@1.3.2"
    },
    "github:jspm/nodelibs-querystring@0.1.0": {
      "querystring": "npm:querystring@0.2.0"
    },
    "github:jspm/nodelibs-readline@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-repl@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-string_decoder@0.1.0": {
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "github:jspm/nodelibs-timers@0.1.0": {
      "timers-browserify": "npm:timers-browserify@1.1.0"
    },
    "github:jspm/nodelibs-tls@0.1.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "github:jspm/nodelibs-tty@0.1.0": {
      "tty-browserify": "npm:tty-browserify@0.0.0"
    },
    "github:jspm/nodelibs-url@0.1.0": {
      "url": "npm:url@0.10.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "github:jspm/nodelibs-zlib@0.1.0": {
      "browserify-zlib": "npm:browserify-zlib@0.1.4"
    },
    "npm:asn1.js-rfc3280@1.0.0": {
      "asn1.js": "npm:asn1.js@1.0.2"
    },
    "npm:asn1.js@1.0.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "bn.js": "npm:bn.js@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:browserify-aes@0.8.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:browserify-rsa@1.1.1": {
      "bn.js": "npm:bn.js@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0"
    },
    "npm:browserify-sign@2.8.0": {
      "bn.js": "npm:bn.js@1.0.0",
      "browserify-rsa": "npm:browserify-rsa@1.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@1.0.1",
      "inherits": "npm:inherits@2.0.1",
      "parse-asn1": "npm:parse-asn1@2.0.0",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:browserify-zlib@0.1.4": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "pako": "npm:pako@0.2.5",
      "process": "github:jspm/nodelibs-process@0.1.0",
      "readable-stream": "npm:readable-stream@1.1.13",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:buffer@3.0.1": {
      "base64-js": "npm:base64-js@0.0.8",
      "ieee754": "npm:ieee754@1.1.4",
      "is-array": "npm:is-array@1.0.1"
    },
    "npm:console-browserify@1.1.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "date-now": "npm:date-now@0.1.4",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:core-util-is@1.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:create-ecdh@1.0.3": {
      "bn.js": "npm:bn.js@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@1.0.1"
    },
    "npm:crypto-browserify@3.9.6": {
      "browserify-aes": "npm:browserify-aes@0.8.1",
      "browserify-sign": "npm:browserify-sign@2.8.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-ecdh": "npm:create-ecdh@1.0.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "diffie-hellman": "npm:diffie-hellman@2.2.3",
      "inherits": "npm:inherits@2.0.1",
      "pbkdf2-compat": "npm:pbkdf2-compat@2.0.1",
      "public-encrypt": "npm:public-encrypt@1.1.2",
      "ripemd160": "npm:ripemd160@0.2.0",
      "sha.js": "npm:sha.js@2.3.6",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:diffie-hellman@2.2.3": {
      "bn.js": "npm:bn.js@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "miller-rabin": "npm:miller-rabin@1.1.5",
      "process": "github:jspm/nodelibs-process@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:domain-browser@1.1.3": {
      "events": "github:jspm/nodelibs-events@0.1.0"
    },
    "npm:elliptic@1.0.1": {
      "bn.js": "npm:bn.js@1.0.0",
      "brorand": "npm:brorand@1.0.5",
      "hash.js": "npm:hash.js@1.0.2",
      "inherits": "npm:inherits@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:events-browserify@0.0.1": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:hash.js@1.0.2": {
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:https-browserify@0.0.0": {
      "http": "github:jspm/nodelibs-http@1.7.0"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:miller-rabin@1.1.5": {
      "bn.js": "npm:bn.js@1.0.0",
      "brorand": "npm:brorand@1.0.5"
    },
    "npm:os-browserify@0.1.2": {
      "os": "github:jspm/nodelibs-os@0.1.0"
    },
    "npm:pako@0.2.5": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "zlib": "github:jspm/nodelibs-zlib@0.1.0"
    },
    "npm:parse-asn1@2.0.0": {
      "asn1.js": "npm:asn1.js@1.0.2",
      "asn1.js-rfc3280": "npm:asn1.js-rfc3280@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "pemstrip": "npm:pemstrip@0.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:pbkdf2-compat@2.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0"
    },
    "npm:public-encrypt@1.1.2": {
      "bn.js": "npm:bn.js@1.0.0",
      "browserify-rsa": "npm:browserify-rsa@1.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "parse-asn1": "npm:parse-asn1@2.0.0"
    },
    "npm:punycode@1.3.2": {
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:readable-stream@1.1.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.1",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.0",
      "stream": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:ripemd160@0.2.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:sha.js@2.3.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:timers-browserify@1.1.0": {
      "process": "npm:process@0.5.2"
    },
    "npm:url@0.10.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "punycode": "npm:punycode@1.3.2",
      "querystring": "github:jspm/nodelibs-querystring@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.0"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    }
  }
});

