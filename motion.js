/* ==========================================================
   Плавная прокрутка + появление блоков при скролле
   Один цикл requestAnimationFrame на всё, чтобы не дёргалось.
   На тач-устройствах и при «меньше движения» нативная прокрутка.
   ========================================================== */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  // ?static — отключает инерцию и эффекты (нужно для скриншотов целой страницы)
  const forceStatic = new URLSearchParams(location.search).has('static');
  const smoothEnabled = finePointer && !reduceMotion && !forceStatic;

  // В статичном режиме отключаем и появление, и плавный скролл
  if (forceStatic) {
    root.classList.add('is-static');
    root.style.scrollBehavior = 'auto';
  }

  const maxY = () => root.scrollHeight - window.innerHeight;
  const clampY = (value) => Math.max(0, Math.min(maxY(), value));

  let target = window.scrollY;   // куда хотим приехать
  let current = target;          // где находимся сейчас
  let running = false;

  const blocks = Array.from(document.querySelectorAll('[data-scroll]'));

  // Пересчёт прозрачности и сдвига по позиции блока в окне
  const paint = () => {
    if (forceStatic) return;
    const vh = window.innerHeight;

    for (const el of blocks) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) continue; // далеко за экраном — не считаем

      // 0 — блок только показался снизу, 1 — поднялся на полэкрана
      const enter = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.5)));
      // 0 — блок ещё в кадре, 1 — его низ ушёл выше 45% экрана
      const exit = Math.min(1, Math.max(0, (vh * 0.45 - r.bottom) / (vh * 0.45)));

      el.style.opacity = (enter * (1 - exit * 0.92)).toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - enter) * 44 - exit * 36).toFixed(1)}px, 0)`;
    }
  };

  const frame = () => {
    current += (target - current) * 0.115; // коэффициент «инерции»

    if (Math.abs(target - current) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      paint();
      running = false;
      return;
    }

    window.scrollTo(0, current);
    paint();
    requestAnimationFrame(frame);
  };

  const start = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  if (smoothEnabled) {
    // отключаем CSS-сглаживание, иначе scrollTo анимируется дважды
    root.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return;           // не мешаем масштабированию страницы
      e.preventDefault();
      target = clampY(target + e.deltaY);
      start();
    }, { passive: false });

    // клавиши, скроллбар, тач — синхронизируем цель с реальной позицией
    window.addEventListener('scroll', () => {
      if (!running) {
        target = current = window.scrollY;
        paint();
      }
    }, { passive: true });

    // якоря ведём тем же плавным циклом
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href').slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;

      e.preventDefault();
      target = el === document.body
        ? 0
        : clampY(el.getBoundingClientRect().top + window.scrollY - 72);
      start();

      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  } else {
    // без «инерции»: эффекты появления на обычном скролле
    let waiting = false;
    window.addEventListener('scroll', () => {
      if (waiting) return;
      waiting = true;
      requestAnimationFrame(() => {
        paint();
        waiting = false;
      });
    }, { passive: true });
  }

  paint();
  window.addEventListener('resize', paint);
})();
