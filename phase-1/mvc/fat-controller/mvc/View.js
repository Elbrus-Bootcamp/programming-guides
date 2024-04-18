const readlineSync = require('readline-sync');

class View {
  renderSelectTopicPage(themes) {
    // нам пришёл список тем, нужно вывести их на экран
    // здесь твой код...

    // затем даём пользователю возможность выбрать тему
    const topic = readlineSync.question('Введите тему: ');

    // и возвращаем контроллеру выбранную тему
    return topic;
  }
}

module.exports = View;
