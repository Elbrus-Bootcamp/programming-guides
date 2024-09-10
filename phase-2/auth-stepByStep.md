## Необходимые пакеты

```bash
npm i bcrypt cookie-parser jsonwebtoken
```

### Порядок подключения модулей для авторизации

1. jwt.config модуль который будет использоваться глобально для всего приложения для общей
   настройки JWT

```js
src / cofigs / jwt.config.js;

const jwtConfig = {
  access: {
    expiresIn: 1000 * 5,
  },
  refresh: {
    expiresIn: 1000 * 60 * 60 * 5,
  },
};

module.exports = jwtConfig;
```

2. cookie.config модуль который будет использован для конфигурации cookie+jwt с
   одинаковыми параметрами срока жизни

```js
src / configs / cookie.config.js;

const jwtConfig = require('./jwt.config');

const cookieConfig = {
  access: {
    maxAge: jwtConfig.access.expiresIn,
    httpOnly: true,
  },
  refresh: {
    maxAge: jwtConfig.refresh.expiresIn,
    httpOnly: true,
  },
};

module.exports = cookieConfig;
```

3. generateTokens модуль принимающий данные пользователя как payload и возвращающий объект
   с jwt токенами.

```bash
//Добавляем в .env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

```js
src / utils / generateTokens.js;

require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtConfig = require('../configs/jwt.config');

const generateTokens = (payload) => ({
  accessToken: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, jwtConfig.access),
  refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, jwtConfig.refresh),
});

module.exports = generateTokens;
```

4. middleware для проверки accessToken и refreshToken

```js
src / middlewares / verifyTokens.js;

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid access token');
    return res.sendStatus(403);
  }
};

const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid refresh token');
    return res.clearCookie('refreshToken').sendStatus(401);
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
```

> res.locals в Express — это объект, который используется для передачи данных от
> middleware или маршрута к шаблонизатору (view engine) или другим middleware в рамках
> одного HTTP-запроса. Этот объект доступен только в течение жизни текущего запроса и
> автоматически сбрасывается после завершения обработки запроса. Иногда бывает необходимо
> передать данные из одного middleware в другое. res.locals — идеальное место для хранения
> таких временных данных, поскольку они доступны во всех последующих middleware и
> маршрутах, связанных с текущим запросом.

5. Пример регистрации/авторизации/выхода пользователя

```js
const authRouter = require('express').Router();

const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateTokens = require('../utils/generateTokens');
const cookieConfig = require('../configs/cookie.config');

authRouter.post('/signup', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, password: await bcrypt.hash(password, 10) },
    });

    if (!created) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const plainUser = user.get();
    delete plainUser.password;

    const { accessToken, refreshToken } = generateTokens({ user: plainUser });

    res
      .cookie('refreshToken', refreshToken, cookieConfig.refresh)
      .json({ user: plainUser, accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

Пример авторизации пользователя

```js
authRouter.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Не верный логин или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Не верный логин или пароль' });
    }

    const plainUser = user.get();
    delete plainUser.password;

    const { accessToken, refreshToken } = generateTokens({ user: plainUser });
    res
      .cookie('refreshToken', refreshToken, cookieConfig.refresh)
      .json({ user: plainUser, accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

Пример logout

```js
authRouter.get('/logout', (req, res) => {
  res.clearCookie('refreshToken').sendStatus(200);
});
```

6. Создание отдельного endPoint для верификации refreshToken (будет применяться когда
   пользователь заново зашел в приложение или истек срок годности accsessToken)

```js
/src/routes/token.router.js

const tokenRouter = require('express').Router();
const cookieConfig = require('../configs/cookie.config');
const { verifyRefreshToken } = require('../middlewares/verifyTokens');
const generateTokens = require('../utils/generateTokens');

tokenRouter.get('/refresh', verifyRefreshToken, (req, res) => {
  const { accessToken, refreshToken } = generateTokens({
    user: res.locals.user,
  });

  return res
    .cookie('refreshToken', refreshToken, cookieConfig.refresh)
    .json({ user: res.locals.user, accessToken });
});

module.exports = tokenRouter;
```

## Фронтенд

> Axios Interceptors — это механизм в библиотеке Axios, который позволяет перехватывать
> запросы и ответы до того, как они будут обработаны или отправлены. С помощью
> интерсепторов вы можете изменять или обрабатывать запросы и ответы, выполнять общие
> операции, такие как добавление заголовков, обработка ошибок, повторные попытки запросов
> и т.д.
>
> > Request Interceptors (Интерсепторы запросов):Эти интерсепторы позволяют перехватывать
> > запросы перед их отправкой на сервер. Это полезно для добавления стандартных
> > заголовков (например, токенов аутентификации), логирования, модификации данных запроса
> > и других операций.

> > Response Interceptors (Интерсепторы ответов) Эти интерсепторы позволяют перехватывать
> > ответы от сервера до того, как они будут переданы в ваш код. Вы можете использовать их
> > для обработки ошибок, анализа данных, повторных попыток запросов в случае ошибок и
> > других операций.

```js
/src/api/axiosInstance.js


import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
});

let accessToken = "";

function setAccessToken(newToken) {
  accessToken = newToken;
}

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;
    if (error.response.status === 403 && !prevRequest.sent) {
      const response = await axios("/api/tokens/refresh");
      accessToken = response.data.accessToken;
      prevRequest.sent = true;
      prevRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(prevRequest);
    }
    return Promise.reject(error);
  }
);

export { setAccessToken };

export default axiosInstance;
```

# Auth

## Bcrypt

**bcrypt** — это популярная и надежная библиотека для хеширования паролей, которая
используется для безопасного хранения паролей в базах данных. Хеширование паролей с
использованием bcrypt делает их более защищенными от атак, таких как перебор паролей
(brute-force) и атаки по радужным таблицам (rainbow table attacks).

### Основные особенности bcrypt:

1. **Адаптивная сложность (cost factor):**
   - bcrypt использует параметр сложности (так называемый cost factor), который определяет
     количество итераций алгоритма. Чем выше значение этого параметра, тем больше времени
     требуется для хеширования пароля. Это замедляет атаки перебора паролей, поскольку
     каждый возможный пароль будет хешироваться дольше.
2. **Соль (Salt):**
   - bcrypt автоматически генерирует уникальную "соль" для каждого хеша пароля. Соль — это
     случайная строка, которая добавляется к паролю перед хешированием. Это делает каждый
     хеш уникальным даже для одинаковых паролей и защищает от атак по радужным таблицам.
3. **Хеширование и проверка:**
   - bcrypt не только хеширует пароли, но и предоставляет метод для проверки хеша. Когда
     пользователь вводит пароль, bcrypt снова хеширует этот пароль с той же солью и
     сравнивает результат с сохраненным хешем.

### Пример использования:

В Node.js bcrypt можно использовать с помощью библиотеки `bcrypt` или `bcryptjs`
(последняя является чистой реализацией на JavaScript, что может быть полезно, если вы не
хотите использовать нативные модули).

### Установка:

```jsx
npm install bcrypt
```

```jsx
const bcrypt = require('bcrypt');

const saltRounds = 10; // Уровень сложности
const plainPassword = 'mySecurePassword';

async function hashAndComparePassword() {
  try {
    // Генерация хеша пароля
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Хеш пароля:', hash);

    // Сравнение пароля и хеша
    const result = await bcrypt.compare(plainPassword, hash);
    console.log('Пароль верен:', result); // true
  } catch (err) {
    console.error('Ошибка:', err);
  }
}
```

## Cookies

Cookies — это небольшие текстовые файлы, которые веб-сайты сохраняют на вашем устройстве
(компьютере, смартфоне, планшете) через браузер. Эти файлы содержат данные, которые
позволяют сайтам «запоминать» вас, когда вы посещаете их снова.

## Express cookies

```jsx
//expressjs.com/en/api.html#res.cookie

//установить cookies
https: res.cookie('rememberme', '1', {
  expires: new Date(Date.now() + 900000),
  httpOnly: true,
});
//удалить cookie
res.cookie('name', 'tobi', { path: '/admin' });
res.clearCookie('name', { path: '/admin' });
```

## Cookie-parser

Это middleware для Node.js, которое используется в Express-приложениях для работы с
cookies (куки). Оно автоматически парсит (разбирает) заголовок `Cookie` в запросах,
преобразуя его в объект, доступный в `req.cookies`, что упрощает работу с куки в серверных
приложениях

```jsx
npm i cookie-parser //установка
const cookieParser = require('cookie-parser'); //подключение
app.use(cookieParser()); //применение
```

# JWT

**JWT (JSON Web Token)** — это стандарт для создания токенов, которые используются для
передачи информации между двумя сторонами в формате JSON. Эти токены обычно используются
для аутентификации и передачи информации между клиентом и сервером.

Состоит из

1. Header (Заголовок): Содержит информацию о типе токена (обычно это `JWT`) и алгоритме
   шифрования, который используется для создания подписи токена (например, `HS256` для
   HMAC SHA256).
2. **Payload (Полезная нагрузка)**: Содержит утверждения (claims), которые представляют
   собой информацию о пользователе и других данных. Эти утверждения могут быть
   стандартными (например, `iss` — издатель токена, `exp` — время истечения токена) или
   произвольными, добавленными по необходимости (например, `user_id`, `role`).
3. **Signature (Подпись)**: Подпись создается путем объединения закодированного заголовка
   и полезной нагрузки, а затем их шифрования с использованием секретного ключа или
   приватного ключа (в зависимости от алгоритма). Подпись необходима для проверки
   целостности токена и того, что он не был изменен.

## Установка и использование

```jsx
npm i jsonwebtoken //установка
const jwt = require('jsonwebtoken'); //подключение
const obj = {group:"raccoons", count: 18} //данные для payload JWT
const token = jwt.sign(obj, "secretPhrase", { expiresIn: '15m' }); //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6InJhY2Nvb25zIiwiY291bnQiOjE4LCJpYXQiOjE3MjM5OTg3MDAsImV4cCI6MTcyMzk5OTYwMH0.4-0P8-FgIn9IxU6qREuk9_Lpri2W_2rfk6DNxSzvzy4
```

Проверка токена:

```jsx
try {
  const decoded = jwt.verify(token, 'secretPhrase');
  console.log('Токен валиден:', decoded);
} catch (err) {
  console.error('Ошибка проверки токена:', err.message);
}
```

## Порядок подключения модулей для авторизации:

1. **`jwt.config` модуль который будет использоваться глобально для всего приложения для
   общей настройки JWT**

```jsx
/cofigs/jwt.config.js

const jwtConfig = {
  access: {
    expiresIn: 1000 * 5,
  },
  refresh: {
    expiresIn: 1000 * 60 * 60 * 5,
  },
};

module.exports = jwtConfig;
```

1. **`cookie.config` модуль который будет использован для конфигурации `cookie+jwt` с
   одинаковыми параметрами срока жизни**

```jsx
/configs/cookie.config.js

const jwtConfig = require('./jwt.config');

const cookieConfig = {
  access: {
    maxAge: jwtConfig.access.expiresIn,
    httpOnly: true,
  },
  refresh: {
    maxAge: jwtConfig.refresh.expiresIn,
    httpOnly: true,
  },
};

module.exports = cookieConfig;
```

1. **`generateTokens` модуль принимающий данные пользователя как `payload` и возвращающий
   объект с jwt токенами.**

```jsx
//Добавляем в .env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

```jsx
/utils/generateTokens.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwtConfig = require('../configs/jwt.config');

const generateTokens = (payload) => ({
  accessToken: jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    jwtConfig.access
  ),
  refreshToken: jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    jwtConfig.refresh
  ),
});

module.exports = generateTokens;
```

1. **`middleware` для проверки `accessToken` и `refreshToken`**

```jsx
/middlewares/verifyTokens.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid access token');
    return res.sendStatus(403);
  }
};

const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid refresh token');
    return res.clearCookie('refreshToken').sendStatus(401);
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
```

> `res.locals` в Express — это объект, который используется для передачи данных от
> middleware или маршрута к шаблонизатору (view engine) или другим middleware в рамках
> одного HTTP-запроса. Этот объект доступен только в течение жизни текущего запроса и
> автоматически сбрасывается после завершения обработки запроса.

Иногда бывает необходимо передать данные из одного middleware в другое. `res.locals` —
идеальное место для хранения таких временных данных, поскольку они доступны во всех
последующих middleware и маршрутах, связанных с текущим запросом.

>

1. **Пример регистрации/авторизации/выхода пользователя**

```jsx
const authRouter = require('express').Router();

const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateTokens = require('../utils/generateTokens');
const cookieConfig = require('../configs/cookie.config');

authRouter.post('/signup', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, password: await bcrypt.hash(password, 10) },
    });

    if (!created) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const plainUser = user.get();
    delete plainUser.password;

    const { accessToken, refreshToken } = generateTokens({ user: plainUser });

    res
      .cookie('refreshToken', refreshToken, cookieConfig.refresh)
      .json({ user: plainUser, accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Пример авторизации пользователя**

```jsx
authRouter.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Не верный логин или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Не верный логин или пароль' });
    }

    const plainUser = user.get();
    delete plainUser.password;

    const { accessToken, refreshToken } = generateTokens({ user: plainUser });
    res
      .cookie('refreshToken', refreshToken, cookieConfig.refresh)
      .json({ user: plainUser, accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Пример logout**

```jsx
authRouter.get('/logout', (req, res) => {
  res.clearCookie('refreshToken').sendStatus(200);
});
```

1. Создание отдельного `endPoint` для верификации `refreshToken` (будет применяться когда
   пользователь заново зашел в приложение или истек срок годности `accsessToken`)

```jsx
/src/routes/token.router.js

const tokenRouter = require('express').Router();
const cookieConfig = require('../configs/cookie.config');
const { verifyRefreshToken } = require('../middlewares/verifyTokens');
const generateTokens = require('../utils/generateTokens');

tokenRouter.get('/refresh', verifyRefreshToken, (req, res) => {
  const { accessToken, refreshToken } = generateTokens({
    user: res.locals.user,
  });

  return res
    .cookie('refreshToken', refreshToken, cookieConfig.refresh)
    .json({ user: res.locals.user, accessToken });
});

module.exports = tokenRouter;
```

## Конфигурация axios instance и interceptors (фронтенд):

> **Axios Interceptors** — это механизм в библиотеке Axios, который позволяет
> перехватывать запросы и ответы до того, как они будут обработаны или отправлены. С
> помощью интерсепторов вы можете изменять или обрабатывать запросы и ответы, выполнять
> общие операции, такие как добавление заголовков, обработка ошибок, повторные попытки
> запросов и т.д.

**Request Interceptors** (Интерсепторы запросов):

- Эти интерсепторы позволяют перехватывать запросы перед их отправкой на сервер. Это
  полезно для добавления стандартных заголовков (например, токенов аутентификации),
  логирования, модификации данных запроса и других операций.

**Response Interceptors** (Интерсепторы ответов):

- Эти интерсепторы позволяют перехватывать ответы от сервера до того, как они будут
  переданы в ваш код. Вы можете использовать их для обработки ошибок, анализа данных,
  повторных попыток запросов в случае ошибок и других операций.

```jsx
/src/api/axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
});

let accessToken = "";

function setAccessToken(newToken) {
  accessToken = newToken;
}

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;
    if (error.response.status === 403 && !prevRequest.sent) {
      const response = await axios("/api/tokens/refresh");
      accessToken = response.data.accessToken;
      prevRequest.sent = true;
      prevRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(prevRequest);
    }
    return Promise.reject(error);
  }
);

export { setAccessToken };

export default axiosInstance;
```

### Пример получения пользователя при перезагрузке страницы

```js
useEffect(() => {
  axiosInstance('/tokens/refresh')
    .then(({ data }) => {
      setTimeout(() => {
        setUser({ status: 'logged', data: data.user });
      }, 1000);
      setAccessToken(data.accessToken);
    })
    .catch(() => {
      setUser({ status: 'guest', data: null });
      setAccessToken('');
    });
}, []);
```

### Пример хендлеров авторизации/регистрации/логаут

```js
const logoutHandler = () => {
  axiosInstance.get('/auth/logout').then(() => setUser({ status: 'guest', data: null }));
};

const signUpHandler = (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  if (!formData.email || !formData.password || !formData.name) {
    return alert('Missing required fields');
  }
  axiosInstance.post('/auth/signup', formData).then(({ data }) => {
    setUser({ status: 'logged', data: data.user });
    setAccessToken(data.accessToken);
  });
};

const signInHandler = (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  if (!formData.email || !formData.password) {
    return alert('Missing required fields');
  }
  axiosInstance.post('/auth/signin', formData).then(({ data }) => {
    setUser({ status: 'logged', data: data.user });
    setAccessToken(data.accessToken);
  });
};
```
