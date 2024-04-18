class Controller {
  #model;

  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  run() {
    const model = this.#model;
    // отображаем ту страницу, на которой мы сейчас находимся
    switch (model.getPage()) {
      case 'start': {
        const topic = this.#view.renderSelectTopicPage(model.getTopics());
        model.chooseTopic(topic);
        return this.run();
      }
      // ...
    }
  }
}

module.exports = Controller;
