# Краткий гайд по CORS в Express.js

## Установка

```bash
npm install cors
npm install express
```

## Конфигурация CORS

Объект `corsOptions` задаёт параметры для управления CORS.

```javascript
const corsOptions = {
  // Access-Control-Allow-Origin: определяет разрешённые источники.
  // Возможные значения: строка, "*", массив, RegExp, функция, true (отражает источник), false (отключает CORS).
  origin: '*',

  // Access-Control-Allow-Methods: разрешённые HTTP-методы.
  // Возможные значения: строка (например, "GET,POST"), массив.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

  // Access-Control-Allow-Headers: разрешённые заголовки запроса.
  // Возможные значения: строка, массив. Без указания отражает заголовки предзапроса.
  allowedHeaders: ['Content-Type', 'Authorization'],

  // Access-Control-Expose-Headers: заголовки, доступные клиенту.
  // Возможные значения: строка, массив.
  exposedHeaders: ['Content-Range', 'X-Content-Range'],

  // Access-Control-Allow-Credentials: разрешает cookies и авторизацию.
  // Возможные значения: true, false.
  credentials: true,

  // Access-Control-Max-Age: время кэширования предзапроса (в секундах).
  // Возможные значения: целое число.
  maxAge: 3600,

  // Передаёт ответ на предзапрос следующему обработчику.
  // Возможные значения: true, false.
  preflightContinue: false,

  // Код состояния для успешных запросов OPTIONS.
  // Возможные значения: целое число (например, 200).
  optionsSuccessStatus: 200,
};
```

## Применение

**Глобальное использование:**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.get('/api', (req, res) => res.json({ message: 'CORS настроен' }));

app.listen(3000, () => console.log('Сервер на порту 3000'));
```

**Для конкретного маршрута:**

```javascript
app.get('/public', cors(corsOptions), (req, res) => res.json({ message: 'CORS для маршрута' }));
```

## Обработка предзапросов

Для сложных запросов (например, DELETE, PUT):

```javascript
app.options('*', cors(corsOptions));
```

## Лучшие практики

- Указывайте конкретные домены в `origin` вместо `*`.
- Храните настройки в `.env` для продакшена.
- Разрешайте только необходимые заголовки и методы.
- Тестируйте CORS через консоль браузера или Postman.

## Источники

- [Express.js CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [GitHub: cors](https://github.com/expressjs/cors)
