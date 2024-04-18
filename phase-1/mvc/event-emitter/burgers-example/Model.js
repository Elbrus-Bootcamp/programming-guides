const { EventEmitter } = require('events');

class Model extends EventEmitter {
  // Страница, на которй в данный момент находится пользователь:
  // 'burgers' - стартовая страница, на которой отображаются все созданные бургеры
  // 'make-burger' - страница создания нового бургера
  #page = 'burgers';

  // Массив уже созданных бургеров. Каждый бургер в свою очередь будет представлять
  // из себя массив ингридиентов. То есть #burgers - это массив массивов.
  #burgers = [];

  // Бургер, который мы создаём в данный момент. Массив строк-ингридиентов.
  #currentBurger;

  // #page, #burgers, #currentBurger - приватные поля. Чтобы обращаться к ним из
  // других классов сделаем методы-геттеры.

  getPage() {
    return this.#page;
  }

  getCurrentBurger() {
    return this.#currentBurger;
  }

  getBurgers() {
    return this.#burgers;
  }

  // Перейти на страницу создания бургера
  startMakeBurger() {
    this.#page = 'make-burger';
    this.#currentBurger = [];
    this.emit('update');
  }

  // Добавить новый ингридиент к текущему бургеру
  addIngridient(indgridient) {
    this.#currentBurger.push(indgridient);
    this.emit('update');
  }

  // Закончить создание бургера и перейти на стартовую страницу
  stopMakeBurger() {
    if (this.#currentBurger.length) {
      this.#burgers.push(this.#currentBurger);
      this.#currentBurger = undefined;
    }
    this.#page = 'burgers';
    this.emit('update');
  }
}

module.exports = Model;
