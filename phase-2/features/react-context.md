# React Context Guide

[Читайте подробнее в официальной документации](https://react.dev/learn/passing-data-deeply-with-context)

## Подключение

В данном гайде будет создан контекст с состоянием аутентификации

### 1. Создание контекста

Создай файл `AuthContext.js` и создай пустой контекст:

```js
import { createContext } from 'react';

const AuthContext = createContext();

export default AuthContext;
```

### 2. Подключение контекста

В компоненте `App.jsx` импортируй контекст и оберни приложение в провайдер

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import AuthContext from './contexts/authContext';

export default function App() {
  // Создаём/вытаскиваем все требуемые данные для аутентификации
  const { user, signupHandler, loginHandler, logoutHandler } = useAuth();

  const router = createBrowserRouter(/* Роутинг приложения */);
  return (
    <AuthContext
      // Передаем все требуемые данные в проп value
      value={{ user, signupHandler, loginHandler, logoutHandler }}
    >
      <RouterProvider router={router} />
    </AuthContext>
  );
}
```

У компонента `<AuthContext>` задай `value` и передай туда объект со всеми полями,
которые могут потребоваться дальше в приложении.

### 3. Использование контекста

В любом дочернем компоненте вместо пропсов используй хук `use`, чтобы достать
данные из контекста:

```jsx
import { use, useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

export default function NavigationBar() {
  // Забираем данные из контекста через хук useContext
  const { user, logoutHandler } = use(AuthContext);
  return (
    <div className="my-2 navbar-expand-md" color="dark" dark>
      <a href="/">{user ? `Привет, ${user.name}` : 'Гость'}</a>
      <nav className="me-auto" navbar>
        <NavLink className="nav-link" to="/">
          Главная
        </NavLink>
        <NavLink className="nav-link" to="/signup">
          Регистрация
        </NavLink>
        <button onClick={logoutHandler}>Выйти</button>
      </nav>
    </div>
  );
}
```
