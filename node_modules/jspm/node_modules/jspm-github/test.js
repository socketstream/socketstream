var github = require('./github');

github = new github({
  baseDir: '.',
  log: true,
  tmpDir: '.',
  username: '',
  password: ''
});

github.getVersions('angular/bower-angular', function(versions) {
  console.log(versions);
  github.download('angular/bower-angular', 'v1.2.12', 'e8a1df5f060bf7e6631554648e0abde150aedbe4', 'test-repo', function() {
    console.log('done');
  }, function(err) {
    console.log(err);
  });
});
