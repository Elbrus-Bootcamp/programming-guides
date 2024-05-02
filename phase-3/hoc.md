# HOC guide

## Описание

_Компоненты высшего порядка (Higher-Order Components, HOC)_ являются распространенным паттерном в React, который используется для повторного использования логики между компонентами. HOC - это функции, которые принимают компонент и возвращают новый компонент с расширенной функциональностью.

Основная идея HOC заключается в том, чтобы изолировать повторяемую логику и обернуть её внутри HOC, чтобы её можно было применить к нескольким компонентам без дублирования кода. Это позволяет упростить код, сделать его более модульным и поддерживаемым. Принимаемые компонент попадает в проп `children`

## Примеры

### Loader HOC

```tsx
type LoaderProps = {
  children: JSX.Element;
  loading: boolean;
};

export default function Loader({
  children,
  loading,
}: LoaderProps): JSX.Element {
  if (loading) {
    return <Spinner color="primary">Loading...</Spinner>;
  }
  return children;
}
```

### PrivateRoute HOC (использует React Router Dom)

```tsx
type PrivateRouteProps = {
  isAllowed: boolean;
  children?: JSX.Element;
  redirect?: string;
};

export default function PrivateRoute({
  children,
  isAllowed,
  redirect = "/",
}: PrivateRouteProps): JSX.Element {
  if (!isAllowed) return <Navigate to={redirect} />;
  return children || <Outlet />;
}
```

### ContextProvider HOC

***НУЖНО ДОБАВИТЬ***