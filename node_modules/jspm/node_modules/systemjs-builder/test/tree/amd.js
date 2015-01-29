define(['./global', './some!./plugin', './text.txt!./text-plugin'], function(a, b, c) {
  return { is: 'amd', text: c };
});
