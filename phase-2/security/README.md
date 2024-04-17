# Auth Security Guide

## Введение

Данный гайд описывает некоторые практики защиты web-приложения.

## Защита на клиенте

### ProtectedRoute

Компонент высшего порядка (Higher-Order Component) `ProtectedRoute` позволяет гибко настраивать страницы, которые доступны для пользователя:

```js
export default function ProtectedRoute({
  isAllowed,
  redirectPath = "/",
  children,
}) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children || <Outlet />;
}
```

Его можно использовать в качестве враппера вокруг одного роута, а также группировать несколько роутов под одно условие:

```jsx
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage user={user} /> },
      {
        element: <ProtectedRoute isAllowed={!user} />,
        children: [
          { path: "/signup", element: <SignupPage /> },
          { path: "/login", element: <LoginPage /> },
        ],
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute isAllowed={user.isAdmin}>
            <AdminDashboardPage user={user} />
          </ProtectedRoute>
        ),
      },
      {
        path: "/account",
        element: (
          <ProtectedRoute isAllowed={user} redirectPath="/login">
            <AccountPage user={user} />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

### Изменение элементов интерфейса

Кнопки навигации должны отличаться для гостя и для авторизованного пользователя. Этого можно добиться тернарным оператором.

Элементы взаимодействия на странице должны быть доступны только для авторизованного на такие действия пользователя. Например, кнопки удаления и редактирования поста должны быть доступны только для автора данного поста.

### Хранение токенов

Самым надёжным местом для хранения токенов являются `httpOnly` cookie или состояние приложения. Хранение токенов или любой чувствительной информации в `localStorage` является уязвимым к XSS атакам и считается неприемлемой практикой.

## Защита на бэкенде

### Шифрование паролей

В базе данных никогда не стоит хранить пароли в чистом виде. Для шифрования паролей можно использовать зарекомендовавший себя алгоритм bcrypt. Для NodeJs есть одноимённый пакет `bcrypt` [ссылка на npm](https://www.npmjs.com/package/bcrypt)

### Мидлвары проверки авторства

Чтобы защитить данные от несанкционированного доступа по сетевому запросу необходимо не только верифицировать access токен, но и проверять авторизацию конкретного действия. Например, выполнить эндпоинт по удалению поста может только автор данного поста.
