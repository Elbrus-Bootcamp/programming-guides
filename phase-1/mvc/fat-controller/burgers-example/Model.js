class Model {
  // Страница, на которой в данный момент находится пользователь:
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
  }

  // Добавить новый ингридиент к текущему бургеру
  addIngridient(indgridient) {
    this.#currentBurger.push(indgridient);
  }

  // Закончить создание бургера и перейти на стартовую страницу
  stopMakeBurger() {
    // если в бургере есть хоть один ингридиент, то добавляем его в список готовых бургеров
    if (this.#currentBurger.length) {
      this.#burgers.push(this.#currentBurger);
      this.#currentBurger = undefined;
    }

    // переходим обратно на стартовую страницу
    this.#page = 'burgers';
  }
}

module.exports = Model;
