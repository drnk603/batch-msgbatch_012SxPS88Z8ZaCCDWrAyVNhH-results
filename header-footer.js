(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var menu = header.querySelector('.dr-nav-menu');
  if (!toggle || !menu) return;

  var openClass = 'is-open';
  var activeClass = 'is-active';

  function setState(isOpen) {
    if (isOpen) {
      menu.classList.add(openClass);
      toggle.classList.add(activeClass);
      toggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    } else {
      menu.classList.remove(openClass);
      toggle.classList.remove(activeClass);
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    }
  }

  toggle.addEventListener('click', function () {
    var isOpen = !menu.classList.contains(openClass);
    setState(isOpen);
  });

  header.addEventListener('click', function (event) {
    if (!menu.classList.contains(openClass)) return;
    if (!menu.contains(event.target) && event.target !== toggle && !toggle.contains(event.target)) {
      setState(false);
    }
  });
})();