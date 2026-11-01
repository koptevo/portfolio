// ===== Мобильное меню =====
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  burger.classList.toggle('is-active', open);
  burger.setAttribute('aria-expanded', String(open));
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    menu.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// ===== Линия под шапкой при скролле =====
const header = document.querySelector('.top');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}, { passive: true });

// ===== Появление блоков при скролле =====
const revealEls = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

// ===== Бегущая строка =====
// Анимация сдвигает ленту на -50%, поэтому лента должна состоять
// из двух одинаковых половин и быть шире экрана хотя бы вдвое.
// Иначе на широком мониторе справа появляется пустота.
const marquee = document.getElementById('marquee');

if (marquee) {
  const base = marquee.innerHTML; // одна «порция» текста
  let resizeTimer;

  const buildMarquee = () => {
    // сброс до одной копии, чтобы честно измерить её ширину
    marquee.innerHTML = base;
    const oneCopy = marquee.scrollWidth;
    if (!oneCopy) return;

    // сколько копий нужно, чтобы заполнить два экрана
    const needed = Math.ceil((window.innerWidth * 2) / oneCopy);
    // половины должны быть равны — значит, копий чётное число
    const copies = Math.max(2, needed % 2 === 0 ? needed : needed + 1);

    marquee.innerHTML = base.repeat(copies);

    // скорость постоянная: ~50 px/сек, сколько бы копий ни было
    const halfWidth = marquee.scrollWidth / 2;
    marquee.style.animationDuration = Math.max(10, Math.round(halfWidth / 50)) + 's';
  };

  buildMarquee();

  // при изменении ширины окна пересчитываем (например, развернули на весь экран)
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildMarquee, 250);
  });
}

// ===== Год в подвале =====
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
