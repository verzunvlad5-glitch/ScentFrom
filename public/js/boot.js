/* boot.js — завантажувач: отримує каталог і довідкові дані із сервера, перевіряє сесію,
   після чого по черзі підключає решту скриптів (атрибут data-scripts). Так модулі, що
   працюють із SFV.data синхронно, не потребують переписування. */
(function (w, d) {
  'use strict';

  var SFV = w.SFV;
  var me = d.currentScript;
  var list = (me.getAttribute('data-scripts') || '').split(',').filter(Boolean);

  function load(name) {
    return new Promise(function (resolve, reject) {
      var s = d.createElement('script');
      s.src = 'js/' + name + '.js';
      s.async = false;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Не вдалося завантажити ' + name + '.js'));
      };
      d.body.appendChild(s);
    });
  }

  function showError(message) {
    var main = d.querySelector('main') || d.body;
    var box = d.createElement('div');
    box.className = 'server-error';
    box.setAttribute('role', 'alert');
    box.innerHTML = '<b>Сервер недоступний.</b> <span></span> <button type="button" class="btn btn--ghost">Спробувати ще раз</button>';
    box.querySelector('span').textContent = message;
    box.querySelector('button').addEventListener('click', function () {
      w.location.reload();
    });
    main.insertBefore(box, main.firstChild);
  }

  SFV.api
    .request('GET', '/api/bootstrap')
    .then(function (data) {
      Object.keys(data).forEach(function (k) {
        SFV.data[k] = data[k];
      });
      return list.reduce(function (chain, name) {
        return chain.then(function () {
          return load(name);
        });
      }, Promise.resolve());
    })
    .then(function () {
      // токен міг застаріти: оновлюємо профіль у фоні, інтерфейс оновиться подією sfv:change
      return SFV.store.Auth.refresh().then(function (user) {
        if (!user) w.dispatchEvent(new CustomEvent('sfv:change'));
      });
    })
    .catch(function (err) {
      showError(err && err.message ? err.message : 'Спробуйте пізніше.');
    });
})(window, document);
