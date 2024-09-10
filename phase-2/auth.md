# Auth guide

## Введение

Данный гайд описывает процесс имплементации модуля **auth**. Везде далее при использовании
термина **auth** подразумевается обобщение аутентификации, авторизации и других понятий,
связанных с ними.

## User

Модель пользователя на сервере -- объект с полями `id, name, email, hashpass`. Вот пример
пользователя:

```json
{
  "id": 3,
  "name": "Алекс",
  "email": "alex@mail.com",
  "hashpass": "214bb3053ee0b535889cabacbede342",
  "createdAt": "2024-09-10T07:19:22.514Z",
  "updatedAt": "2024-09-10T07:19:22.514Z"
}
```

На клиенте пользователь может быть в одном из 3 состояний:

0. `undefined` -- неопределённый пользователь (пока выполняется загрузка)
1. `{ id, name, email }` -- определённый пользователь с данными
2. `null` -- определённый пользователь, как гость

## Пошаговая имплементация

### Установи пакеты

```
npm i jsonwebtoken cookie-parser bcrypt
```

- `jsonwebtoken` для работы с JWT
- `cookie-parser` для парсинга куки
- `bcrypt` для хэширования паролей

### Подготовка базы данных

Опиши модель пользователя, задай необходимые поля. Например, используй команду для
создания модели `User`:

```
npx sequelize-cli model:create --name User --attributes name:string,email:string,hashpass:string
```

Пропиши связь между пользователем и другими сущностями своего приложения. Например, добавь
в модель `Post` поле `userId` и свяжи модель `User` с моделью `Post` в миграциях
`server/db/migrations`

```
// Миграция для Posts
userId: {
  type: Sequelize.INTEGER,
  references: {
    model: {
      tableName: 'Users',
    },
    key: 'id',
  },
  onDelete: 'CASCADE',
  allowNull: false,
},
```

и в моделях `server/db/models`

```js
// Файл post.js
class Post extends Model {
  static associate({ User }) {
    this.belongsTo(User, { foreignKey: 'userId' });
  }
}

// Файл user.js
class User extends Model {
  static associate({ Post }) {
    this.hasMany(Post, { foreignKey: 'userId' });
  }
}
```

Пропиши сиды, учитывая новое поле `userId`

### Создание axios instance на клиенте

Создай файл с описанием конфигурации сетевых запросов через `axios`, создай экземпляр
через `axios.create` и выполни его экспорт. Например файл `client/src/axiosInstance.js`:

```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Если хочешь использовать переменные окружения, то пиши import.meta.env.VITE_API_BASEURL,
  withCredentials: true,
});

export default axiosInstance;
```

В будущем для совершения запросов используй `axiosInstance`.

### Создание страницы регистрации

Создай компонент страницы, в котором будут поля ввода, кнопки и логика по созданию нового
аккаунта. Например, создай компонент `client/src/components/SignupPage.jsx` с формочкой

```js
import React from 'react';

export default function SignupPage() {
  return (
    <form>
      <input name="email" type="email" placeholder="Введи email" />
      <input name="password" type="password" placeholder="Введи пароль" />
      <input name="name" type="text" placeholer="Введи имя пользователя" />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

В компоненте `client/src/App.jsx` создай состояние на юзера

```js
const [user, setUser] = useState();
```

Напиши обработчик отправки формы регистрации в компоненте `client/src/App.jsx`:

```js
const signupHandler = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData);
    const res = await axiosInstance.post('/auth/signup', data);
    // обработка ответа res (сюда допишем позже)
}
```

Добрось `signupHandler` из `App.jsx` в компонент странички регистрации `SignupPage.jsx` в
роутере:

```jsx
<SignupPage signupHandler={signupHandler} />
```

### Создай конфигурации для куки и токенов

Создай файл `server/src/configs/jwtConfig.js` и заполни его содержимое:

```js
const jwtConfig = {
  access: {
    expiresIn: `${1000 * 5}`, // 5 секунд
  },
  refresh: {
    expiresIn: `${1000 * 60 * 60 * 12}`, // 12 часов
  },
};

module.exports = jwtConfig;
```

а также создай файл с конфигом для куки `server/src/configs/cookieConfig.js`:

```js
const jwtConfig = require('./jwtConfig');

const cookieConfig = {
  httpOnly: true,
  maxAge: jwtConfig.refresh.expiresIn,
  // Поля ниже могут пригодиться, если браузер не выписывает куки
  // secure: true,
  // sameSite: 'strict',
};

module.exports = cookieConfig;
```

Чтобы время жизни cookie и refreshToken были синхронизированы, лучше использовать
подготовленный ранее файл с конфигурацией JWT. Поля `sameSite` и `secure` могут
понадобится для некоторых версий браузеров, которые запрещают установку cookie от разных
источников.

### Пропиши переменные окружения с секретами

В файле переменных окружения на сервере `server/.env` и `server/.env.example` пропиши две
новых переменных окружения с секретами для генерации токенов:

```
DB_USER=
DB_PASS=
DB_NAME=
PORT=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

### Подготовь функции генерации токенов

Создай файл `server/src/utils/generateTokens.js` и опиши логику по генерации токенов. Вот
пример:

```js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../configs/jwtConfig');
require('dotenv').config();

function generateTokens(payload) {
  return {
    accessToken: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, jwtConfig.access),
    refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, jwtConfig.refresh),
  };
}

module.exports = generateTokens;
```

### Подготовь эндпоинт на сервере с регистрацией

Создай роутер для всех эндпоинтов, связанных с auth, например
`server/src/routes/authRouter.js`. Опиши логику эндпоинта по регистрации нового аккаунта.
Например, при регистрации сервер должен убедиться, что создаваемый аккаунт не был создан
до этого:

```js
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateTokens = require('../utils/generateTokens');
const cookieConfig = require('../configs/cookieConfig');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(401).send({ message: 'Fill all fields' });

    const [foundUser, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, password: await bcrypt.hash(password, 10) },
    });
    if (!created) return res.status(403).json({ message: 'User already exists' });

    const user = foundUser.get();
    delete user.password;
    const { accessToken, refreshToken } = generateTokens({ user });

    // в ответе refreshToken пишем в куки, а accessToken отправляем в теле ответа
    return res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .status(200)
      .json({ accessToken, user });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

module.exports = authRouter;
```

Подключи роутер в сервере `server/src/app.js`:

```js
//...
const authRouter = require('./routes/authRouter');
//...
app.use('/api/auth', authRouter);
//...
```

### Подключение перехватчиков

В файле `client/src/axiosInstance.js` с описанием экземпляра axios создай переменную для
access токена, подключи перехватчики запроса и ответа. Например:

```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let accessToken = '';

export function setAccessToken(token) {
  accessToken = token;
}

// Перехватчик запросов
axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Перехватчик ответа
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;
    if (error.response.status === 403 && !prevRequest.sent) {
      const response = await axios('/api/tokens/refresh');
      accessToken = response.data.accessToken;
      prevRequest.sent = true;
      prevRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(prevRequest);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
```

Перехватчики нужны для автоматизации процесса взаимодействия с сервером через токена
доступа.

Как они работают:

- в приложении есть переменная, которая хранит `accessToken`
- в каждый запрос через `axiosInstance` автоматически добавляется заголовок
  `Authorization: Bearer yourJwtAccessToken` с помощью перехватчика запросов
- перехватчик ответа должен автоматически обновить токен доступа, если запрос не был
  успешно выполнен из-за истечения срока годности `accessToken`
- перехватчик ответа:
  - если пришедший статус от сервера не 403, то ничего не делать -- это позволит различать
    ошибки при отвалившемся токене от всех остальных ошибок сервера
  - если перехваченный ответ уже до этого был перехвачен (`config.sent`), то ничего не
    делать -- это позволит избежать бесконечного цикла ревалидации токена
  - если в ответе статус 403, и запрос был выслан впервые, то:
    - попробовать обновить access token через запрос на сервер (`'/api/tokens/refresh'`)
    - новый токен записать в переменную, а также проставить поле `config.sent`, что запрос
      уже был до этого отправлен
    - добавить новый токен в прошлый неудавшийся запрос
      (`config.headers.Authorization = ...`)
    - повторить ещё раз прошлый запрос с новым токеном `return axiosInstance(config);`

### Завершение регистрации

Во время обработки запроса на клиенте после успешной регистрации нужно:

- записать полученного пользователя в состояние
- сохранить accessToken

Вот пример `signupHandler` в компоненте `client/src/App.jsx`:

```js
const signupHandler = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const res = await axiosInstance.post('/auth/signup', data);
    if (res.status !== 200) alert('Ошибка регистрации');
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
}
```

### Отображение пользователя

Выведи пользователя на консоль, чтобы убедиться в успешности регистрации. Теперь его можно
отобразить в навигации -- передай с помощью пропсов `user` из `App.jsx` в компонент
навигации, например, `Navbar.jsx`. Используй тернарный оператор для отображения имени
пользователя:

```jsx
export default function NavigationBar({ user }) {
  // ...
  return (
    ...
    <p>{user?.id ? `Привет, ${user.name}` : 'Гостевой аккаунт'}</p>
    ...
  )
}
```

### Вход в приложение

Аналогично сделай для входа в существующую учётную запись:

- На клиенте:
  - подготовь страницу на клиенте `client/src/components/LoginPage.jsx`
  - подключи страницу в роутинг
  - создай обработчик `loginHandler` в компоненте `App.jsx` по аналогии с `signupHandler`

```js
const loginHandler = async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const res = await axiosInstance.post('/auth/login', data);
  setUser(res.data.user);
  setAccessToken(res.data.accessToken);
};
```

- На сервере:
  - пропиши эндпоинт входа

Ниже пример эндпоинта на сервере:

```js
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: 'Fill fields' });
    }

    const foundUser = await User.findOne({
      where: { email },
    });
    if (!foundUser) return res.status(401).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, foundUser.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });

    const user = foundUser.get();
    delete user.password;
    const { accessToken, refreshToken } = generateTokens({ user });

    return res
      .cookie('refreshToken', refreshToken, cookiesConfig)
      .status(200)
      .json({ accessToken, user });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});
```

### Пропиши логику выхода

Сервер должен очищать куки в браузере, а клиент должен очищать access токен из переменной.
Для очистки используй метод `clearCookie`.

- На клиенте:
  - создай кнопку на клиенте для выхода из учётной записи в навигации
  - создай обработчик выхода в `App.jsx`

```js
const logoutHandler = async () => {
  await axiosInstance.get('/auth/logout');
  setUser(null);
  setAccessToken('');
};
```

- повесь `logoutHandler` на кнопку в навигации
- На сервере:
  - пропиши эндпоинт выхода

```js
authRouter.get('/logout', (req, res) => {
  res.clearCookie('refreshToken').sendStatus(200);
});
```

### Пропиши мидлвары проверок токенов

В файле `server/src/middlewares/verifyAccessToken.js` напиши логику проверки токена
доступа. Например:

```js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyAccessToken(req, res, next) {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = user;
    next();
  } catch (error) {
    console.log('Access token error');
    res.sendStatus(403);
  }
}

module.exports = verifyAccessToken;
```

А в файле `server/src/middlewares/verifyRefreshToken.js` напиши логику проверки токена
обновления. Например:

```js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyRefreshToken(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.locals.user = user;
    next();
  } catch (error) {
    console.log('Refresh token error');
    res.clearCookie('refreshToken').sendStatus(401);
  }
}

module.exports = verifyRefreshToken;
```

### Добавь эндпоинт перевыпуска токенов

Если access токен закончил срок действия, то по действующему refresh можно получить новую
пару токенов. Создай роутер `server/src/routes/tokensRouter.js` и опиши эндпоинт:

```js
const express = require('express');
const verifyRefreshToken = require('../middlewares/verifyRefreshToken');
const generateTokens = require('../utils/generateTokens');
const cookieConfig = require('../configs/cookieConfig');

const tokensRouter = express.Router();

tokensRouter.get('/refresh', verifyRefreshToken, async (req, res) => {
  const { user } = res.locals;
  const { accessToken, refreshToken } = generateTokens({ user });
  res.cookie('refreshToken', refreshToken, cookieConfig).json({ accessToken, user });
});

module.exports = tokensRouter;
```

И подключи роутер в сервере:

```js
app.use('/api/tokens', tokensRouter);
```

### Загрузка пользователя при загрузке страницы

В компоненте `client/src/App.jsx` пропиши хук `useEffect`, который будет делать запрос для
получения актуальных данных юзера по куки:

```js
useEffect(() => {
  axiosInstance('/tokens/refresh')
    .then((res) => {
      setUser(res.data.user);
      setAccessToken(res.data.accessToken);
    })
    .catch(() => setUser(null));
}, []);
```

### Подключи верификацию авторизации действия

Например, в твоём приложении есть эндпоинт, который возвращает все посты пользователя.
Подключи мидлвару `verifyAccessToken` для авторизации данного действия:

```js
apiPostsRouter.get('/personal', verifyAccessToken, async (req, res) => {
  const posts = await Post.findAll({
    where: { userId: res.locals.user.id },
    include: User,
  });
  res.json(posts);
});
```
