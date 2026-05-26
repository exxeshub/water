window.addEventListener('load', function () {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('loader-hidden');
    setTimeout(() => loader.remove(), 450);
  }
});

const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 720) {
      document.activeElement.blur();
    }
  });
});
