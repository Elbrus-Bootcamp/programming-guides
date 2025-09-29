# Гайд по работе с библиотекой express-rate-limit

Библиотека `express-rate-limit` используется для ограничения количества запросов (rate limiting) к серверу на основе Express.js. Она помогает защитить приложение от атак типа "брут-форс" (brute force), чрезмерной нагрузки или злоупотребления API. В данном руководстве мы рассмотрим основы настройки и использования `express-rate-limit` на примере предоставленного кода.

## Установка библиотеки

Для начала установите библиотеку в ваш проект:

```bash
npm install express-rate-limit
```

## Основы работы

Библиотека `express-rate-limit` позволяет задавать лимиты на количество запросов в заданное временное окно для определённых маршрутов или всего приложения. Она работает как middleware и легко интегрируется с Express.js.

### Импорт библиотеки

```javascript
import { rateLimit } from 'express-rate-limit';
```

Или, если вы используете CommonJS:

```javascript
const { rateLimit } = require('express-rate-limit');
```

## Пример настройки

Рассмотрим пример middleware `authLimiter`, который ограничивает количество попыток входа в систему, как в предоставленном коде:

```javascript
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-минутное окно
  max: 5, // Максимум 5 попыток входа за 15 минут
  message: {
    error: 'Слишком много попыток входа',
    retryAfter: '15 минут',
    hint: 'Попробуйте восстановить пароль, если забыли его',
  },
  standardHeaders: 'draft-8', // Современные RateLimit заголовки
  legacyHeaders: false, // Отключить устаревшие X-RateLimit-* заголовки
  skipSuccessfulRequests: true, // НЕ считать успешные входы
  skipFailedRequests: false, // СЧИТАТЬ неудачные попытки
  keyGenerator: ipKeyGenerator(), // Идентификация по IP адресу (по умолчанию)
  handler: (req, res) => {
    res.status(429).json({
      error: 'Превышен лимит попыток входа',
      message: 'Слишком много неудачных попыток. Попробуйте позже.',
      retryAfter: 'Повторить попытку можно через 15 минут',
    });
  },
});

export default authLimiter;
```

### Разбор параметров

1. **`windowMs`**: Временное окно в миллисекундах, в течение которого отслеживается количество запросов. В примере — 15 минут (`15 * 60 * 1000`).

2. **`max`**: Максимальное количество запросов, разрешённых в течение `windowMs` для одного ключа (например, IP-адреса). В примере — 5 попыток.

3. **`message`**: Сообщение или объект, возвращаемый клиенту при превышении лимита. В примере возвращается JSON-объект с информацией об ошибке.

4. **`standardHeaders`**: Указывает версию заголовков `RateLimit-*` (например, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) в ответе. Значение `draft-8` соответствует современным стандартам.

5. **`legacyHeaders`**: Если `false`, отключает старые заголовки (`X-RateLimit-*`). Рекомендуется отключать их для современных приложений.

6. **`skipSuccessfulRequests`**: Если `true`, успешные запросы (например, успешный вход в систему) не учитываются в лимите. В примере это включено, чтобы не ограничивать пользователей, которые успешно вошли.

7. **`skipFailedRequests`**: Если `true`, неудачные запросы не учитываются. В примере это `false`, так как важно учитывать неудачные попытки входа.

8. **`keyGenerator`**: Функция, определяющая ключ для отслеживания запросов (по умолчанию — IP-адрес). В примере используется `ipKeyGenerator()` для идентификации по IP.

9. **`handler`**: Функция, которая вызывается при превышении лимита. В примере возвращается HTTP-ответ с кодом 429 (Too Many Requests) и JSON-сообщением.

## Интеграция с Express

Middleware `authLimiter` можно подключить к конкретным маршрутам или всему приложению. В предоставленном коде он применяется только к маршруту `/login`:

```js
import express from 'express';
import authLimiter from '../configs/authLimiter.config.js';
import AuthController from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/login', authLimiter, AuthController.login);

export default authRouter;
```

Здесь `authLimiter` применяется только к маршруту `POST /login`, чтобы ограничить попытки входа, но не затрагивать другие маршруты, такие как `/register` или `/logout`.

### Применение ко всему приложению

Если вы хотите ограничить запросы для всех маршрутов, добавьте middleware в приложение:

```javascript
app.use(authLimiter);
```

## Кастомизация keyGenerator

По умолчанию `express-rate-limit` использует IP-адрес клиента для идентификации. Однако вы можете создать собственную функцию `keyGenerator`, чтобы использовать, например, пользовательский ID или токен:

```javascript
const customKeyGenerator = (req) => {
  return req.user ? req.user.id : req.ip; // Используем ID пользователя, если он авторизован
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: customKeyGenerator,
});
```

## Хранение данных о лимитах

По умолчанию `express-rate-limit` хранит данные о запросах в памяти. Для масштабируемых приложений рекомендуется использовать внешнее хранилище, например, Redis. Для этого установите пакет `rate-limit-redis`:

```bash
npm install rate-limit-redis
```

Пример настройки с Redis:

```javascript
import { createClient } from 'redis';
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const client = createClient({
  url: 'redis://localhost:6379',
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  }),
});
```

## Обработка ошибок и логирование

Для отслеживания превышения лимитов можно добавить логирование в `handler`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res, next, options) => {
    console.log(`Лимит превышен для IP: ${req.ip}`);
    res.status(429).json({
      error: 'Слишком много запросов',
      retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' минут',
    });
  },
});
```

## Советы по использованию

1. **Ограничение чувствительных маршрутов**: Применяйте rate limiting к критическим маршрутам, таким как `/login`, `/register` или API для сброса пароля, чтобы защититься от атак.

2. **Гибкость лимитов**: Для разных маршрутов можно создавать разные экземпляры `rateLimit` с разными настройками `max` и `windowMs`.

3. **Информирование клиентов**: Используйте заголовки `RateLimit-*` и понятные сообщения об ошибках, чтобы клиенты знали, когда можно повторить запрос.

4. **Тестирование**: Убедитесь, что лимиты не мешают нормальной работе приложения, особенно если у вас много легитимных запросов.

## Заключение

Библиотека `express-rate-limit` — мощный инструмент для управления нагрузкой на сервер и защиты от злоупотреблений. Она проста в настройке, гибка и поддерживает интеграцию с внешними хранилищами, такими как Redis. Используйте её для защиты ваших маршрутов, особенно тех, которые связаны с аутентификацией, как в примере с `authLimiter`.
