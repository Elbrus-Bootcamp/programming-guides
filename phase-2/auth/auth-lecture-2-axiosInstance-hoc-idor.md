## Сервер

# Отдельный endPoint для верификации refreshToken (будет применяться когда пользователь заново зашел в приложение или истек срок годности accsessToken)

1. Создание middleware для проверки accessToken и refreshToken

```js
src / middlewares / verifyTokens.js;

const jwt = require("jsonwebtoken");
require("dotenv").config();
const formatResponse = require("../utils/formatResponse");

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1]; // Bearer <token>
    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log("Invalid access token", error);
    return res.status(403).json(formatResponse(403, "Forbidden"));
  }
};

const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log("Invalid refresh token", error);
    return res
      .clearCookie("refreshToken")
      .status(401)
      .json(formatResponse(401, "Unauthorized"));
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
```

1. Добавление метода для refsreshToken в контроллер

```js
/src/controllers/AuthController.js

static async refreshTokens(req, res) {
    try {
      const { user } = res.locals;

      const { accessToken, refreshToken } = generateTokens({ user });

      res.status(200).cookie('refreshToken', refreshToken, cookieConfig.refresh).json(
        formatResponse(200, 'Success', {
          user,
          accessToken,
        }),
      );
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(formatResponse(500, 'Internal server error', null, message));
    }
  }
```

2. Подключение метода в authRouter.js

```js
const { verifyRefreshToken } = require("../middlewares/verifyTokens");
authRouter.get(
  "/refreshTokens",
  verifyRefreshToken,
  AuthController.refreshTokens
);
```

3.Пример подключения middleware для проверки AccessToken в роут создания крафта

```js
craftRouter.post('/', verifyAccessToken, CraftController.createCraft);
```



## Клиент

1. Обновление axiosInstance

```js
src / shared / lib / axiosInstance.js;

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
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
      const response = await axiosInstance("/auth/refreshTokens");
      accessToken = response.data.data.accessToken;
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

2. Добавляем сохранение accessToken в форме Регистрации и Входа:

```js
// уже есть в форме: setUser({ status: "logged", data: res.data.data.user });
setAccessToken(res.data.data.accessToken);
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

2. Добавление useEffect в App.jsx. Пример получения пользователя при перезагрузке страницы

```js
useEffect(() => {
  axiosInstance("/auth/refreshTokens")
    .then((res) => {
      setUser({ status: "logged", data: res.data.data.user });
      setAccessToken(res.data.data.accessToken);
    })
    .catch(() => {
      setUser({ status: "guest", data: null });
      setAccessToken("");
    });
}, []);
```

3. Пример выхода пользователя из приложения

```js
const logoutHandler = () => {
  axiosInstance
    .get("/auth/logout")
    .then(() => {
      setUser({ status: "guest", data: null });
      setAccessToken("");
    })
    .catch((error) => {
      console.log(error);
      setUser({ status: "guest", data: null });
      setAccessToken("");
    });
};
```


## HOCs

1. Создание HOC Loader

```js
client / src / shared / hocs / Loader.jsx;
import React from "react";

export default function Loader({ children, isLoading }) {
  return isLoading ? <div>Loading</div> : children;
}
```

2. Подключение Loader в Layout.jsx

```js
<Loader isLoading={user.status === "logging"}>
  <NavBar user={user} logoutHandler={logoutHandler} />
  <Container fluid>
    <Outlet />
  </Container>
</Loader>
```

3. Создание HOC ProtectedRoute

```js
client / src / shared / hocs / ProtectedRoute.jsx;
import React from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute({
  children,
  isAllowed,
  redirectTo = "/",
}) {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return children || <Outlet />;
}
```

4. Подключение ProtectedRoute в Router.jsx

```js
<Routes>
  <Route element={<Layout user={user} logoutHandler={logoutHandler} />}>
    <Route path="/" element={<MainPage />} />
    <Route path="/crafts" element={<CraftPage />} />
    <Route path="/crafts/add" element={<CraftAddPage />} />
    <Route element={<ProtectedRouter isAllowed={user.status !== "logged"} />}>
      <Route path="/signup" element={<SignUpPage setUser={setUser} />} />
      <Route path="/login" element={<LoginPage setUser={setUser} />} />
    </Route>
    <Route path="/crafts/:craftId" element={<CraftOnePage />} />
    <Route
      path="/jane"
      element={
        <ProtectedRouter
          isAllowed={user.status === "logged" && user.data.name === "Jane"}
        >
          {" "}
          <h1> Jane's page</h1>
        </ProtectedRouter>
      }
    />
    <Route path="*" element={<h1>No content</h1>} />
  </Route>
</Routes>
```
