class Controller {
  #model;

  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    // Здесь подпишемся на события View и решим, что нужно делать с моделью при их возникновении
    // View наследует метод on от класса EventEmitter
    this.#view.on(
      // каждый раз когда View генерирует событие 'makeBurger'
      'makeBurger',
      // вызываем метод startMakeBurger модели
      () => this.#model.startMakeBurger()
    );
    this.#view.on('addIngridient', (ingridient) => this.#model.addIngridient(ingridient));
    this.#view.on('stopMakeBurger', () => this.#model.stopMakeBurger());
  }

  // Контроллер - главный класс, с его метода run начинается работа нашего приложения
  run() {
    // попросим View отобразить первоначальный экран
    this.#view.render();
  }
}

module.exports = Controller;
