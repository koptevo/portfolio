// Демо-форма заказа: ничего не отправляем, только показываем результат
const form = document.getElementById('form');
const ok = document.getElementById('ok');

// Берём поля через elements — надёжнее, чем form.name (это свойство самой формы)
const nameEl = form.elements.namedItem('name');
const phoneEl = form.elements.namedItem('phone');
const serviceEl = form.elements.namedItem('service');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameEl.value.trim();
  const digits = phoneEl.value.replace(/\D/g, '');

  if (name.length < 2) {
    nameEl.focus();
    nameEl.style.borderColor = '#ff6b4a';
    return;
  }

  if (digits.length < 10) {
    phoneEl.focus();
    phoneEl.style.borderColor = '#ff6b4a';
    return;
  }

  form.hidden = true;
  ok.hidden = false;
  ok.textContent = `Готово, ${name}. Заказ «${serviceEl.value}» принят (демо).`;
});

// Снимаем красную рамку при вводе
[ nameEl, phoneEl ].forEach((input) => {
  input.addEventListener('input', () => { input.style.borderColor = ''; });
});
