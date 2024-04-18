const readlineSync = require('readline-sync');

class View {
  // Отобразить стартовую страницу
  renderBurgersPage(burgers) {
    console.log();

    // Если ранее были созданы бургеры, отображаем их
    if (burgers.length) {
      console.log('Бургеры:');
      burgers.forEach(this.#renderBurger);
      console.log();
    }

    readlineSync.question('Нажмите любую клавишу, чтобы сделать бургер…');
  }

  // Отобразить страницу создания бургера
  renderMakeBurgerPage(currentBurger) {
    console.log();

    // Отображаем текущий бургер
    this.#renderBurger(currentBurger);
    console.log();

    console.log('Введите название нового ингридиента или оставьте пустым, чтобы закончить');
    // считываем следующий ингридиент из командной строки и возвращаем его контроллеру
    const ingridient = readlineSync.question('> ');
    return ingridient;
  }

  // Рендерим на экране бургер
  #renderBurger(burger) {
    console.log(`[${burger.join(' | ')}]`);
  }
}

module.exports = View;
