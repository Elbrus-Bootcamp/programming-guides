# Auth guide

## Введение

Данный гайд описывает процесс имплементации модуля **auth**. Везде далее при использовании термина **auth** подразумевается обобщение аутентификации, авторизации и других понятий, связанных с ними.

## Пошаговая имплементация

### Подготовка базы данных

Опиши модель пользователя, задай необходимые поля. Пропиши связь между пользователем и другими сущностями своего приложения. Например, создай модель `User` с полями `email, password, name`, а для модели `Post` пропиши внешний ключ `userId`.

### Создание axios instance на клиенте

Создай файл с описанием конфигурации сетевых запросов через `axios`. Создай экземпляр через `axios.create` и выполни его экспорт. Например:

```js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default axiosInstance;
```

В будущем для совершения запросов используй `axiosInstance`.

### Создание страницы регистрации

Создай компонент страницы, в котором будут поля ввода, кнопки и логика по созданию нового аккаунта. Например, создай компонент `SignupPage` с формочкой

```js
import React from "react";

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

Подключи слушатель события отправки формы `onSubmit`, не забудь предотвратить перезагрузку страницы через `event.preventDefault()`. Соверши запрос через `axiosInstance`:

```js
const submitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData);
    const res = await axiosInstance.post('/api/auth/register', data);
    // обработка ответа res
}

return (
    <form onSubmit={submitHandler}>
    ...
)
```

### Подготовь функции генерации токенов

Создай файл `src/utils/generateTokens.js` и опиши логику по генерации токенов. Вот пример:

```js
function generateTokens(payload) {
  return {
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
  };
}
```

Не забудь прописать новые переменные окружения для генерации подписи. Все конфигурации для токенов лучше хранить в отдельном файле. Вот пример конфигурации для JWT:

```js
const jwtConfig = {
  access: {
    expiresIn: `${1000 * 5}`,
  },
  refresh: {
    expiresIn: `${1000 * 60 * 60 * 12}`,
  },
};
```

### Подготовь эндпоинт на сервере

Создай роутер для всех эндпоинтов, связанных с auth. Опиши логику эндпоинта по регистрации нового аккаунта. Например, при регистрации сервер должен убедиться, что создаваемый аккаунт не был создан до этого:

```js
authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(401).send({ message: "Fill all fields" });

    const [foundUser, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, password: await bcrypt.hash(password, 10) },
    });
    if (!created)
      return res.status(403).json({ message: "User already exists" });

    const user = foundUser.get();
    delete user.password;
    const { accessToken, refreshToken } = generateTokens({ user });

    return res
      .cookie("refreshToken", refreshToken, cookieConfig)
      .status(200)
      .json({ accessToken, user });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});
```

При успешной регистрации refresh токен нужно записывать в куки, а access возвращать через json. Все конфигурации для куки лучше хранить в отдельном файле. Вот пример конфигурации для куки:

```js
const cookieConfig = {
  httpOnly: true,
  maxAge: jwtConfig.refresh.expiresIn,
  // sameSite: 'none',
  // secure: true,
};
```

Чтобы время жизни cookie и refreshToken были синхронизированы, лучше использовать подготовленный ранее файл с конфигурацией JWT. Поля `sameSite` и `secure` могут понадобится для некоторых версий браузеров, которые запрещают установку cookie от разных источников.

### Подключение перехватчиков

В файле с описанием экземпляра axios создай переменную для access токена, подключи перехватчики запроса и ответа. Например:

```js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let accessToken = "";

function setAccessToken(token) {
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
      const response = await axios("/api/tokens/refresh");
      accessToken = response.data.accessToken;
      prevRequest.sent = true;
      prevRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(prevRequest);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

export { setAccessToken };
```

Перехватчики нужны для автоматизации процесса взаимодействия с сервером через токена доступа.

Как они работают:

- в приложении есть переменная, которая хранит `accessToken`
- в каждый запрос через `axiosInstance` автоматически добавляется заголовок `Authorization: Bearer yourJwtAccessToken` с помощью перехватчика запросов
- перехватчик ответа должен автоматически обновить токен доступа, если запрос не был успешно выполнен из-за истечения срока годности `accessToken`
- перехватчик ответа:
  - если пришедший статус от сервера не 403, то ничего не делать -- это позволит различать ошибки при отвалившемся токене от всех остальных ошибок сервера
  - если перехваченный ответ уже до этого был перехвачен (`config.sent`), то ничего не делать -- это позволит избежать бесконечного цикла ревалидации токена
  - если в ответе статус 403, и запрос был выслан впервые, то:
    - попробовать обновить access token через запрос на сервер (`'/api/refresh'`)
    - новый токен записать в переменную, а также проставить поле `config.sent`, что запрос уже был до этого отправлен
    - добавить новый токен в прошлый неудавшийся запрос (`config.headers.Authorization = ...`)
    - повторить ещё раз прошлый запрос с новым токеном `return axiosInstance(config);`

### Завершение регистрации

Во время обработки запроса на клиенте после успешной регистрации нужно:

- записать полученного пользователя в состояние
- записать accessToken в переменную
- перенаправить на другую страницу

```js
const submitHandler = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const res = await axiosInstance.post('/api/auth/register', data);
    if (res.status !== 200) alert('Ошибка регистрации');

    const { user, accessToken } = res.data;
    setUser(user);
    setAccessToken(accessToken);
    navigate('/');
}

return (
    <form onSubmit={submitHandler}>
    ...
)
```

### Вход в приложение

Аналогично сделай для входа в существующую учётную запись:

- подготовь страницу на клиенте
- пропиши эндпоинт на сервере

Ниже пример эндпоинта на сервере:

```js
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Fill fields" });
    }

    const foundUser = await User.findOne({
      where: { email },
    });
    if (!foundUser) return res.status(401).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, foundUser.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    const user = foundUser.get();
    delete user.password;
    const { accessToken, refreshToken } = generateTokens({ user });

    return res
      .cookie("refreshToken", refreshToken, cookiesConfig)
      .status(200)
      .json({ accessToken, user });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});
```

### Пропиши логику выхода

Сервер должен очищать куки в браузере, а клиент должен очищать access токен из переменной. Для очистки используй метод `clearCookie`:

```js
res.clearCookie("refreshToken").sendStatus(200);
```

### Пропиши мидлвары проверок токенов

В файле `src/middlewares/verifyAccessToken.js` напиши логику проверки токена доступа. Например:

```js
function verifyAccessToken(req, res, next) {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    res.locals.user = user;
    next();
  } catch (error) {
    console.log("Invalid access token");
    res.status(403).send("Invalid access token");
  }
}
```

А в файле `src/middlewares/verifyRefreshToken.js` напиши логику проверки токена обновления. Например:

```js
function verifyRefreshToken(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    res.locals.user = user;
    next();
  } catch (error) {
    console.log("Invalid refresh token");
    res.clearCookie("refreshToken").sendStatus(401);
  }
}
```

### Добавь эндпоинт перевыпуска токенов

Если access токен закончил срок действия, то по действующему refresh можно получить новую пару токенов. Создай этот эндпоинт, например, по адресу `/api/tokens/refresh`:

```js
tokensRouter.get("/refresh", verifyRefreshToken, (req, res) => {
  const { accessToken, refreshToken } = generateTokens({
    user: res.locals.user,
  });
  res
    .cookie("refreshToken", refreshToken, cookiesConfig)
    .status(200)
    .json({ accessToken, user: res.locals.user });
});
```

Для перевыпуска токенов требуется проверить только refresh

### Подключи верификацию авторизации действия

Например, в твоём приложении есть эндпоинт, который возвращает все посты пользователя. Подключи мидлвару `verifyAccessToken` для авторизации данного действия:

```js
apiPostsRouter.get("/personal", verifyAccessToken, async (req, res) => {
  const posts = await Post.findAll({
    where: { userId: res.locals.user.id },
    include: User,
  });
  res.json(posts);
});
```
