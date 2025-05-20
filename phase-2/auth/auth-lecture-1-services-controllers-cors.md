# Добавление аутентификации и авторизации в проект Crafts (Сайт об изделиях ручной работы)

## Сервер

### Необходимые пакеты

```bash
npm i bcrypt cookie-parser jsonwebtoken
```

### Модернизация базы данных
1. Добавить модель User

```bash
npx sequelize model:generate --name User --attributes name:string,email:string,password:string
```

2. Изменить временную метку в миграции User
3. В модели и миграции Craft добавить authorId
4. Пример миграции User: установлено свойство unique для email

```javascript
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Users");
  },
};
```

4. Если есть сиды - seeders, то добавить сид для таблицы Users и свойство authorId в сиды Craft. Для хеширования пароля в сидах для User необходимо использовать bcrypt.

### Порядок подключения модулей для авторизации

1. jwtConfig модуль который будет использоваться глобально для всего приложения для общей настройки JWT

```js
src / cofigs / jwtConfig.js;

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

2. cookieConfig модуль который будет использован для конфигурации cookie+jwt с одинаковыми параметрами срока жизни

```js
src / configs / cookieConfig.js;

const jwtConfig = require("./jwtConfig");

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

3. generateTokens модуль принимающий данные пользователя как payload и возвращающий объект с jwt токенами.

```bash
//Добавляем в .env
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

```js
src / utils / generateTokens.js;

require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtConfig = require("../configs/jwtConfig");

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

4. Пример сервиса авторизации

```js
src / services / AuthService.js;

const { User } = require("../../db/models");
class AuthService {
  static async register({ email, name, password }) {
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, password },
    });

    return { user, created };
  }

  static async getUserByEmail({ email }) {
    const user = await User.findOne({ where: { email } });
    return user;
  }
}

module.exports = AuthService;
```

5. Пример контроллера авторизации

```js
src / controllers / AuthController.js;
const cookieConfig = require("../configs/cookieConfig");
const AuthService = require("../services/AuthService");
const generateTokens = require("../utils/generateTokens");
const formatResponse = require("../utils/formatResponse");
const bcrypt = require("bcrypt");

class AuthController {
  static async signup(req, res) {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const { user, created } = await AuthService.register({
        email,
        name,
        password: hashedPassword,
      });

      if (!created) {
        return res.status(400).json(400, "User already exists");
      }
      const plainUser = user.get();
      delete plainUser.password;

      const { accessToken, refreshToken } = generateTokens({ user: plainUser });

      return res
        .cookie("refreshToken", refreshToken, cookieConfig.refresh)
        .json(formatResponse(201, "Success", { accessToken, user: plainUser }));
    } catch (error) {
      console.log(error);
      return res.status(500).json(formatResponse(500, "Internal Server Error"));
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json(formatResponse(400, "Missing required fields"));
    }

    try {
      const user = await AuthService.getUserByEmail({ email });
      if (!user) {
        return res.status(400).json(formatResponse(400, "User not found"));
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res
          .status(400)
          .json(formatResponse(400, "Invalid email or password"));
      }

      const plainUser = user.get();
      delete plainUser.password;

      const { accessToken, refreshToken } = generateTokens({ user: plainUser });
      return res
        .cookie("refreshToken", refreshToken, cookieConfig.refresh)
        .json(formatResponse(200, "Success", { accessToken, user: plainUser }));
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async logout(req, res) {
    res.clearCookie("refreshToken").json(formatResponse(200, "Success"));
  }
}

module.exports = AuthController;
```

6. Создание отдельного route для регистрации, авторизации и выхода

```js
/src/routes/authRouter.js

const authRouter = require('express').Router();
const AuthController = require('../controllers/AuthController');

authRouter.post("/signup", AuthController.signup);
authRouter.post("/login", AuthController.login);
authRouter.get("/logout", AuthController.logout);

module.exports = authRouter;

```

7. Переходим в serverConfig.js для подключения cookie-parser:

```js
const cookieParser = require("cookie-parser");

app.use(cookieParser());
```

8. Переходим в app.js для подключения роутеров к серверу

```js
app.use("/api/auth", authRouter);
```

## Фронтенд

1. Создаем формы авторизации и регистрации
2. Создаем страницы авторизации и регистрации
3. Подключаем страницы в Router.js
4. Подключаем axios для отправки запросов на бэкенд
5. Создаем экземпляр axios с настройками для отправки запросов на бэкенд

```js
/src/shared/lib/axiosInstace.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
});

export default axiosInstance;
```

6. Создаем состояние для полученного от бэкенд пользователя в App.jsx и с помощью props передаем его в компоненты форм и навигации

```js
const [user, setUser] = useState({ status: "logging", data: null });
```

7. Создаем класс для валидации данных. Пример UserValidate.js

```js
/src/entities/user/api/UserValidate.js

export default class UserValidate {
  static validateSignUp({ name, email, password, repeatPassword }) {
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        error: "Введите имя пользователя",
      };
    }

    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: "Введите корректный Email",
      };
    }

    if (!password || password.trim().length < 6) {
      return {
        isValid: false,
        error: "Пароль не менее 6 символов",
      };
    }

    if (repeatPassword !== password) {
      return {
        isValid: false,
        error: "Пароли не совпадают",
      };
    }

    return {
      isValid: true,
      error: null,
    };
  }

  static validateLogin({ email, password }) {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: "Email обязателен",
      };
    }

    if (!password || password.trim().length === 0) {
      return {
        isValid: false,
        error: "Пароль не менее 6 символов",
      };
    }

    return {
      isValid: true,
      error: null,
    };
  }
}
```

8. Создаем класс для взаимодействия с бэкендом. Пример UserApi.js

```js
/src/entities/user/api/UserApi.js

import axiosInstance from "../../../shared/lib/axiosInstace";

export default class UserApi {
  static async signup(userData) {
    const response = await axiosInstance.post("/auth/signup", userData);
    return response;
  }

  static async login(userData) {
    const response = await axiosInstance.post("/auth/login", userData);
    return response;
  }

  static async logout() {
    const response = await axiosInstance("/auth/logout");
    return response;
  }
}

```

9. Пример signUpHandler в компоненте формы регистрации

```js
const signUpHandler = async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  const { isValid, error } = UserValidate.validateSignUp(formData);
  if (!isValid) return alert(error);
  const res = await UserApi.signup(formData);
  setUser({ status: "logged", data: res.data.data.user });
};
```

10. Пример loginHandler в компоненте формы авторизации

```js
const loginHandler = async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  const { isValid, error } = UserValidate.validateLogin(formData);
  if (!isValid) return alert(error);
  const res = await UserApi.login(formData);
  setUser({ status: "logged", data: res.data.data.user });
};
```

11. Пример logoutHandler в компоненте App.jsx

```js
const logoutHandler = async () => {
  await UserApi.logout();
  setUser({ status: "logging", data: null });
}
```


# Auth Теория

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
const bcrypt = require("bcrypt");

const saltRounds = 10; // Уровень сложности
const plainPassword = "mySecurePassword";

async function hashAndComparePassword() {
  try {
    // Генерация хеша пароля
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Хеш пароля:", hash);

    // Сравнение пароля и хеша
    const result = await bcrypt.compare(plainPassword, hash);
    console.log("Пароль верен:", result); // true
  } catch (err) {
    console.error("Ошибка:", err);
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
https: res.cookie("rememberme", "1", {
  expires: new Date(Date.now() + 900000),
  httpOnly: true,
});
//удалить cookie
res.cookie("name", "tobi", { path: "/admin" });
res.clearCookie("name", { path: "/admin" });
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
  const decoded = jwt.verify(token, "secretPhrase");
  console.log("Токен валиден:", decoded);
} catch (err) {
  console.error("Ошибка проверки токена:", err.message);
}
```
