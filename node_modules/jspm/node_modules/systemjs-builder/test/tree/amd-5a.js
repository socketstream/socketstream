function factory() {
  window.jquery = '1';
  return { jquery: '1' };
}

define('jquery', [], factory);