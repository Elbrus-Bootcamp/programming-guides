# Service / Controller

Данный гайд описывает построение абстракций, которые возникают в web-приложениях

## Service на клиенте

### Создание HTTP клиента

Для начала можно использовать готовые решения HTTP клиентов, как экземпляр axios. Его
можно единообразно сконфигурировать для всех совершаемых запросов:

```tsx
import axios from 'axios';
export const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
```

### Создание сервиса

Сервис -- абстракция над сетевыми запросами, которая содержит логику по отправлению
запросов, обработке ответов и предоставлению данных. Любой сервис должен использовать в
себе клиент для совершения запросов -- такой экземпляр внедряется во время конструирования
сервиса. Это позволяет классу быть более гибким и не быть привязанным к конкретной
имплементации клиента. Ниже пример через паттерн `Dependency Injection`.

Необходимо создать класс или несколько классов для различных сущностный приложения. Это
позволит коду быть более читаемым и окажется полезным при тестировании. Внедрение HTTP
клиента (axiosInstance) через конструктор:

```js
import axiosInstance from './axiosInstance';

class ItemService {
  #client;
  constructor(client) {
    this.#client = client;
  }

  async getItems() {
    try {
      const response = await this.#client.get('/items');
      if (response.status !== 200) throw new Error('Неверный статус получения сообщений');
      return response.data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createItem(formData) {
    try {
      const response = await this.#client.post('/items', formData);
      if (response.status === 201) {
        return response.data;
      }
      throw new Error('Возникла ошибка добавления (проверь статус код 201)');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  deleteItem(id) {
    return this.client.delete(`/items/${id}`);
  }
}

const messageService = new MessageService(axiosInstance);

export default messageService;
```

### Абстракция клиента

Чтобы не зависит от явной имплементации HTTP клиента можно построить абстракцию и над ним.
В данном гайде это не будет показано.

## Service на сервере

### Описание

Серверные сервисы, как и клиентские, предоставляют абстракцию над операциями, но
сосредоточены на управлении данными и бизнес-логикой. Основная роль серверного сервиса —
изолировать взаимодействие с базой данных и бизнес-логику, что позволяет организовать
четкую архитектуру и переиспользуемый код. Чаще всего, серверные сервисы инкапсулируют
взаимодействие с ORM или другими API, предоставляя удобные методы для операций с данными.

### Создание сервиса

При создании сервиса используется паттерн `Dependency Injection` для инжектирования
экземпляра базы данных или ORM-клиента, который предоставляет модели данных. Пример ниже
демонстрирует структуру на базе Sequelize ORM, инжектируя объект `db` (экспортируется из
`db/models/index.js`), содержащий все модели и настройки подключения.

```js
const models = require('../../db/models');

class MessageService {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async getAllMessages() {
    const messages = await this.#db.Message.findAll({
      order: [['id', 'DESC']],
      include: this.#db.User,
    });
    return messages;
  }

  async getMessagesWhere(where) {
    const messages = await this.#db.Message.findAll({
      where,
      order: [['id', 'DESC']],
      include: this.#db.User,
    });
    return messages;
  }

  async createMessage(data) {
    const newMessage = await this.#db.Message.create(data);
    const newMessageWithUser = await this.#db.Message.findOne({
      where: { id: newMessage.id },
      include: this.#db.User,
    });
    return newMessageWithUser;
  }

  async editMessage(id, data) {
    const targetMessage = await this.#db.Message.findOne({
      where: { id },
      include: this.#db.User,
    });
    if (!targetMessage) throw new Error('Сообщение не найдено');
    if (data.title) targetMessage.title = data.title;
    if (data.body) targetMessage.body = data.body;
    if (data.img) targetMessage.img = data.img;
    await targetMessage.save();
    return targetMessage;
  }

  async destroyMessage(id) {
    const count = await this.#db.Message.destroy({ where: { id } });
    if (!count) throw new Error('Сообщение не найдено');
    return true;
  }
}

const messageService = new MessageService(models);

module.exports = messageService;
```

Такой подход обеспечивает гибкость, легко расширяется и улучшает общую поддерживаемость
проекта.

## Controller на сервере

### Описание

Контроллеры — это связующее звено между клиентом и серверными сервисами. Они обрабатывают
входящие HTTP-запросы, передают данные в соответствующие сервисы и отправляют ответ
клиенту. Используя `Dependency Injection`, контроллеры получают экземпляры сервисов, что
делает их независимыми от конкретной реализации логики. Благодаря этому, контроллеры
сосредоточены исключительно на маршрутизации и работе с запросами и ответами.

### Создание контроллера

Контроллеры принимают `service` через конструктор, что упрощает их тестирование и
изолирует логику запросов от бизнес-логики, которая хранится в сервисах. Ниже пример
`MessageController`, который работает с `messageService`:

```js
const messageService = require('../services/messageService');

class MessageController {
  #service;

  constructor(service) {
    this.#service = service;
  }

  getMessages = async (req, res) => {
    try {
      const messages = await this.#service.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ text: 'Ошибка получения сообщений', message: error.message });
    }
  };

  postMessage = async (req, res) => {
    try {
      const { title, body } = req.body;
      const filename = req.file ? req.file.filename : null;
      const newMessage = await this.#service.createMessage({
        title,
        body,
        img: filename,
        userId: res.locals.user.id,
      });
      res.status(201).json(newMessage);
    } catch (error) {
      console.log(error);
      res.status(500).json({ text: 'Ошибка создания сообщения', message: error.message });
    }
  };

  getMyMessages = async (req, res) => {
    try {
      const messages = await this.#service.getMessagesWhere({
        userId: res.locals.user.id,
      });
      res.json(messages);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ text: 'Ошибка получения сообщения', message: error.message });
    }
  };

  patchMessageText = async (req, res) => {
    try {
      const updatedMessage = await this.#service.editMessage(
        req.params.messageId,
        req.body,
      );
      res.json(updatedMessage);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ text: 'Ошибка обновления сообщения', message: error.message });
    }
  };

  deleteMessage = async (req, res) => {
    try {
      await this.#service.destroyMessage(req.params.messageId);
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      res.status(500).json({ text: 'Ошибка удаления сообщения', message: error.message });
    }
  };
}

const messageController = new MessageController(messageService);

module.exports = messageController;
```

Таким образом, контроллеры обеспечивают легкую маршрутизацию и управление HTTP-запросами,
а также делают код более организованным и поддерживаемым.

### Подключение контроллера

В примере ниже для `MessageController` определены маршруты на основе его методов.
Middleware функции добавлены для обработки загрузки файлов, проверки токенов доступа и
прав пользователя.

```js
const { Router } = require('express');
const upload = require('../middlewares/upload');
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const checkMessageOwner = require('../middlewares/checkMessageOwner');
const messageController = require('../controllers/messageController');
const messagesRouter = Router();

messagesRouter
  .route('/')
  .get(messageController.getMessages)
  .post(verifyAccessToken, upload.single('img'), messageController.postMessage);

messagesRouter.get('/my', verifyAccessToken, messageController.getMyMessages);

messagesRouter
  .route('/:messageId')
  .patch(verifyAccessToken, checkMessageOwner, messageController.patchMessageText)
  .delete(verifyAccessToken, checkMessageOwner, messageController.deleteMessage);

module.exports = messagesRouter;
```
