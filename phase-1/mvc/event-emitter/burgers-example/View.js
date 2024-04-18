const { EventEmitter } = require('events');
const readlineSync = require('readline-sync');

class View extends EventEmitter {
  #model;

  constructor(model) {
    super();
    this.#model = model;

    this.#model.on(
      // каждый раз когда данные меняются
      'update',
      // обновляем отображение (перерендериваем)
      () => this.render()
    );
  }

  // Отобразить текущую страницу
  render() {
    // Стираем с экрана весь предыдущий текст
    console.clear();

    // отображаем ту страницу, на которой мы сейчас находимся
    switch (this.#model.getPage()) {
      case 'burgers':
        return this.#renderBurgersPage();
      case 'make-burger':
        return this.#renderMakeBurgerPage();
      default:
        throw new Error('Wrong page');
    }
  }

  // Отобразить стартовую страницу
  #renderBurgersPage() {
    // Если ранее были созданы бургеры, отображаем их
    if (this.#model.getBurgers().length) {
      console.log('Бургеры:');
      this.#model.getBurgers().forEach(View.#printBurger);
      console.log();
    }

    readlineSync.question('Нажмите любую клавишу, чтобы сделать бургер…');

    // Клавиша нажата, генерируем событие
    this.emit('makeBurger');
  }

  // Отобразить страницу создания бургера
  #renderMakeBurgerPage() {
    // Отображаем текущий бургер
    View.#printBurger(this.#model.getCurrentBurger());
    console.log();

    console.log('Введите название нового ингридиента или оставьте пустым, чтобы закончить');
    // считываем следующий ингридиент из командной строки
    const ingridient = readlineSync.question('> ');

    // генерируем событие addIngridient если пользователь хочет добавить ингридиент
    // и stopMakeBurger если хочет закончить создание бургера
    if (ingridient) {
      this.emit('addIngridient', ingridient);
    } else {
      this.emit('stopMakeBurger');
    }
  }

  static #printBurger(burger) {
    console.log(`[${burger.join(' | ')}]`);
  }
}

module.exports = View;
