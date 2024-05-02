# HOC guide

## Описание

_Компоненты высшего порядка (Higher-Order Components, HOC)_ являются распространенным паттерном в React, который используется для повторного использования логики между компонентами. HOC - это функции, которые принимают компонент и возвращают новый компонент с расширенной функциональностью.

Основная идея HOC заключается в том, чтобы изолировать повторяемую логику и обернуть её внутри HOC, чтобы её можно было применить к нескольким компонентам без дублирования кода. Это позволяет упростить код, сделать его более модульным и поддерживаемым. Принимаемые компонент попадает в проп `children`

## Примеры

### Loader HOC

```jsx
export default function Loader({ children, isLoading }) {
  if (loading) {
    return <Spinner color="primary">Loading...</Spinner>;
  }
  return children;
}
```

### ProtectedRoute HOC (использует React Router Dom)

_ProtectedRoute_ -- это компонент высшего порядка в React, который используется для ограничения доступа к определенным маршрутам в зависимости от заданного условия. Он гарантирует, что только авторизованные пользователи могут получить доступ к определенным маршрутам или страницам. Это часто используется в приложениях с аутентификацией и контролем доступа на основе ролей.

```jsx
export default function ProtectedRoute({
  children,
  isAllowed,
  redirect = "/",
}) {
  if (!isAllowed) return <Navigate to={redirect} />;
  return children || <Outlet />;
}
```

#### Основные особенности:

- Контроль доступа: Проверяет, имеет ли пользователь необходимые права (определяемые пропсом `isAllowed`) для доступа к компоненту или странице.
- Перенаправление: Если доступ не разрешен, компонент перенаправляет пользователя на заданный путь (по умолчанию `"/"`).
- Гибкое использование: Компонент может либо напрямую рендерить дочерние компоненты (через пропс `children`), либо использовать `<Outlet />` из React Router для рендеринга вложенных маршрутов.

```jsx
const routes = [
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      { // Только гость имеет доступ к /login и /signup
        element: <ProtectedRoute isAllowed={!user} />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/signup",
            element: <SignupPage />,
          },
        ],
      },
      { // Только авторизованный пользователь имеет доступ к /account
        path: "/account",
        element: (
          <ProtectedRoute isAllowed={!!user} redirectPath="/login">
            <AccountPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
```

### ContextProvider HOC

**_НУЖНО ДОБАВИТЬ_**
