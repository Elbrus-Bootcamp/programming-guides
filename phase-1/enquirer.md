# Гайд по использованию библиотеки Enquirer для создания интерактивных CLI запросов

## Что такое Enquirer?

Enquirer — это библиотека для Node.js, которая помогает создавать стильные и удобные запросы в терминале. С её помощью ты можешь задавать пользователю вопросы, получать ответы и делать интерфейс CLI более дружелюбным. Она быстрая, лёгкая и гибкая — подойдёт как для простых утилит, так и для сложных приложений.

---

## Установка

```bash
npm install enquirer --save
```

---

### Одиночный запрос

Самый простой способ — использовать метод `prompt` и передать ему объект с настройками запроса.

```javascript
const { prompt } = require('enquirer');

async function main() {
  const response = await prompt({
    type: 'input',         // Тип запроса: текстовый ввод
    name: 'username',      // Ключ для ответа
    message: 'Как вас зовут?' // Вопрос, который увидит пользователь
  });
  console.log(response); // { username: 'Твоё имя' }
}

main();
```

**Что здесь происходит?**
- `type: 'input'` — это тип запроса (простой текстовый ввод).
- `name: 'username'` — ключ, под которым ответ сохранится в объекте.
- `message` — текст вопроса в терминале.


### Множественные запросы

Если нужно задать несколько вопросов, передай массив объектов в `prompt`.

```javascript
const { prompt } = require('enquirer');

async function main() {
  const response = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Как вас зовут?'
    },
    {
      type: 'input',
      name: 'username',
      message: 'Какой у вас никнейм?'
    }
  ]);
  console.log(response); // { name: 'Имя', username: 'Никнейм' }
}

main();
```

**Результат:**
- Ты получишь объект с ответами на оба вопроса.

---

## Типы запросов

Enquirer поддерживает множество типов запросов. Вот самые популярные с примерами:

### 1. Input (Текстовый ввод)
Простой запрос для ввода текста.

```javascript
const { Input } = require('enquirer');

const prompt = new Input({
  message: 'Как вас зовут?',
  initial: 'Аноним' // Значение по умолчанию
});

prompt.run()
  .then(answer => console.log('Имя:', answer))
  .catch(console.error);
```

### 2. Select (Выбор одного варианта)
Запрос с выбором из списка.

```javascript
const { Select } = require('enquirer');

const prompt = new Select({
  name: 'color',
  message: 'Выберите цвет',
  choices: ['красный', 'зеленый', 'синий']
});

prompt.run()
  .then(answer => console.log('Выбранный цвет:', answer))
  .catch(console.error);
```

### 3. MultiSelect (Выбор нескольких вариантов)
Позволяет выбрать несколько элементов.

```javascript
const { MultiSelect } = require('enquirer');

const prompt = new MultiSelect({
  name: 'colors',
  message: 'Выберите любимые цвета',
  choices: ['красный', 'зеленый', 'синий', 'желтый']
});

prompt.run()
  .then(answer => console.log('Выбранные цвета:', answer))
  .catch(console.error);
```

**Результат:** массив, например `['красный', 'синий']`.

### 4. Confirm (Да/Нет)
Запрос для подтверждения.

```javascript
const { Confirm } = require('enquirer');

const prompt = new Confirm({
  name: 'question',
  message: 'Нравится ли вам Enquirer?'
});

prompt.run()
  .then(answer => console.log('Ответ:', answer ? 'Да' : 'Нет'))
  .catch(console.error);
```

### 5. Password (Ввод пароля)
Маскирует введённые символы.

```javascript
const { Password } = require('enquirer');

const prompt = new Password({
  name: 'password',
  message: 'Введите пароль'
});

prompt.run()
  .then(answer => console.log('Пароль:', answer))
  .catch(console.error);
```

### 6. AutoComplete (Автодополнение при вводе)

**AutoComplete** — это запрос, который помогает пользователю выбрать вариант из списка, подсказывая совпадения по мере ввода текста. Это удобно, если список вариантов длинный.

#### Особенности:
- Показывает только те варианты, которые соответствуют введённому тексту.
- Поддерживает прокрутку и ограничение видимых вариантов.
- Можно настроить множественный выбор (`multiple: true`).

#### Пример кода:
```javascript
const { AutoComplete } = require('enquirer');

const prompt = new AutoComplete({
  name: 'fruit',
  message: 'Выберите любимый фрукт',
  limit: 5, // Показывать не более 5 вариантов
  initial: 'Яблоко', // Значение по умолчанию
  choices: [
    'Яблоко',
    'Апельсин',
    'Банан',
    'Груша',
    'Манго',
    'Киви',
    'Ананас',
    'Виноград'
  ]
});

prompt.run()
  .then(answer => console.log('Выбранный фрукт:', answer))
  .catch(console.error);
```

#### Дополнительные настройки:
| Опция | Тип | Описание |
|-------|-----|----------|
| `limit` | `number` | Максимальное количество отображаемых вариантов. |
| `multiple` | `boolean` | Разрешить выбор нескольких вариантов. |
| `suggest` | `function` | Кастомная функция для фильтрации вариантов. |
| `highlight` | `function` | Стиль для подсветки совпадений. |

### 7. Form (Форма с несколькими полями)

**Form** позволяет пользователю заполнить несколько полей ввода на одном экране. Это как анкета в терминале.

#### Особенности:
- Пользователь переключается между полями с помощью стрелок.
- Можно задавать начальные значения и валидацию для каждого поля.
- Удобно для ввода структурированных данных (например, имя, фамилия, email).

#### Пример кода:
```javascript
const { Form } = require('enquirer');

const prompt = new Form({
  name: 'user',
  message: 'Заполните информацию:',
  choices: [
    { name: 'firstname', message: 'Имя', initial: 'Иван' },
    { name: 'lastname', message: 'Фамилия', initial: 'Иванов' },
    { name: 'email', message: 'Email', initial: 'ivan@example.com' }
  ]
});

prompt.run()
  .then(answer => console.log('Данные:', answer))
  .catch(console.error);
```

#### Результат:
```json
{
  firstname: "Иван",
  lastname: "Иванов",
  email: "ivan@example.com"
}
```

### 8. Survey (Опрос с оценками)

**Survey** — это запрос для проведения опроса, где пользователь оценивает утверждения по шкале (например, от "Совершенно не согласен" до "Полностью согласен").

#### Особенности:
- Пользователь выбирает оценку для каждого утверждения.
- Поддерживает кастомные шкалы (например, 1–5 или "да/нет").
- Удобно для обратной связи или анкетирования.

#### Пример кода:
```javascript
const { Survey } = require('enquirer');

const prompt = new Survey({
  name: 'feedback',
  message: 'Оцените наш сервис',
  scale: [
    { name: '1', message: 'Совершенно не согласен' },
    { name: '2', message: 'Не согласен' },
    { name: '3', message: 'Нейтрально' },
    { name: '4', message: 'Согласен' },
    { name: '5', message: 'Полностью согласен' }
  ],
  choices: [
    { name: 'interface', message: 'Интерфейс удобный' },
    { name: 'speed', message: 'Сервис работает быстро' },
    { name: 'support', message: 'Поддержка отвечает оперативно' }
  ]
});

prompt.run()
  .then(answer => console.log('Ответы:', answer))
  .catch(console.error);
```

#### Результат:
```json
{
  interface: "4",
  speed: "5",
  support: "3"
}
```

### 9. Toggle (Переключатель true/false)

**Toggle** — это запрос, который позволяет пользователю переключаться между двумя значениями (например, "Вкл/Выкл" или "Да/Нет"). Возвращает `true` или `false`.

#### Особенности:
- Простой интерфейс с двумя состояниями.
- Можно кастомизировать текст для включённого и выключенного состояния.
- Удобно для бинарных выборов.

#### Пример кода:
```javascript
const { Toggle } = require('enquirer');

const prompt = new Toggle({
  message: 'Хотите включить уведомления?',
  enabled: 'Да', // Текст для true
  disabled: 'Нет' // Текст для false
});

prompt.run()
  .then(answer => console.log('Уведомления:', answer ? 'Включены' : 'Выключены'))
  .catch(console.error);
```

### 10. Numeral (Ввод числа)

**Numeral** — запрос для ввода числового значения. Проверяет, что введено именно число.

#### Особенности:
- Автоматически проверяет, что введено число.
- Можно настроить валидацию (например, диапазон чисел).
- Возвращает число или строку с числом.

#### Пример кода:
```javascript
const { NumberPrompt } = require('enquirer');

const prompt = new NumberPrompt({
  name: 'age',
  message: 'Сколько вам лет?',
  validate: value => {
    if (value < 0 || value > 120) return 'Введите реальный возраст';
    return true;
  }
});

prompt.run()
  .then(answer => console.log('Возраст:', answer))
  .catch(console.error);
```


---

## Кастомизация

Enquirer позволяет настраивать запросы под свои нужды.

### Изменение стилей
Ты можешь менять цвета текста в запросах.

```javascript
const { prompt } = require('enquirer');

prompt({
  type: 'input',
  name: 'username',
  message: 'Как вас зовут?',
  styles: {
    primary: 'blue',   // Цвет основного текста
    success: 'green'   // Цвет успешного ввода
  }
});
```

### Валидация ввода
Добавь проверку введённых данных.

```javascript
const { prompt } = require('enquirer');

prompt({
  type: 'input',
  name: 'age',
  message: 'Сколько вам лет?',
  validate: value => {
    if (isNaN(value)) return 'Введите число';
    if (value < 18) return 'Вам должно быть больше 18';
    return true;
  }
});
```

**Что происходит?**
- Если ввели не число, выведет ошибку.
- Если возраст < 18, тоже ошибка.

### Создание своего запроса
Ты можешь создать собственный тип запроса, унаследовав класс `Prompt`.

```javascript
const { Prompt } = require('enquirer');

class CounterPrompt extends Prompt {
  constructor(options = {}) {
    super(options);
    this.value = options.initial || 0;
    this.cursorHide();
  }
  up() {
    this.value++;
    this.render();
  }
  down() {
    this.value--;
    this.render();
  }
  render() {
    this.clear();
    this.write(`Количество: ${this.value}`);
  }
}

const prompt = new CounterPrompt({
  message: 'Выберите количество',
  initial: 5
});

prompt.run()
  .then(answer => console.log('Итог:', answer))
  .catch(console.error);
```

**Как это работает?**
- Стрелка вверх увеличивает число, вниз — уменьшает.
- Enter подтверждает выбор.

---

## Асинхронные запросы

Enquirer поддерживает асинхронные операции, например, загрузку вариантов выбора из API.

```javascript
const { prompt } = require('enquirer');
const axios = require('axios');

async function getChoices() {
  const response = await axios.get('https://api.example.com/colors');
  return response.data;
}

async function main() {
  const choices = await getChoices();
  const response = await prompt({
    type: 'select',
    name: 'color',
    message: 'Выберите цвет',
    choices: choices
  });
  console.log(response);
}

main();
```

---

## Полезные клавиши

Enquirer поддерживает удобные комбинации клавиш:
- **Ctrl + C**: Отмена запроса.
- **Ctrl + G**: Сброс запроса.
- **Стрелки**: Навигация по списку.
- **Пробел**: Выбор варианта (для MultiSelect).
- **Enter**: Подтверждение.

---

### Полезные ссылки:
- [Официальная документация](https://github.com/enquirer/enquirer)
- [Примеры на GitHub](https://github.com/enquirer/enquirer/tree/master/examples)
