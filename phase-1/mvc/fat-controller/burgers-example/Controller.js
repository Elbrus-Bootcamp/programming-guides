class Controller {
  #model;

  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  // Контроллер - главный класс, с его метода run начинается работа нашего приложения
  run() {
    // отображаем ту страницу, на которой сейчас находится пользователь
    switch (this.#model.getPage()) {
      case 'burgers': {
        this.#view.renderBurgersPage(this.#model.getBurgers());
        this.#model.startMakeBurger();
        return this.run();
      }

      case 'make-burger': {
        const ingridient = this.#view.renderMakeBurgerPage(this.#model.getCurrentBurger());
        if (ingridient) {
          this.#model.addIngridient(ingridient);
        } else {
          this.#model.stopMakeBurger();
        }
        return this.run();
      }

      default:
        throw new Error('Wrong page');
    }
  }
}

module.exports = Controller;
