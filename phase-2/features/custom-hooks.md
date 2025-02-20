# Кастомные хуки

## Описание

[Читайте подробнее в официальной документации](https://react.dev/learn/reusing-logic-with-custom-hooks)

**_Кастомные хуки_** позволяют выносить повторяющийся код в отдельные логические блоки,
что делает код более чистым и легче поддерживаемым.

Кастомные хуки создаются так же, как и обычные функции, но они должны начинаться с
префикса `use` (например, `useMyHook`). Это соглашение является важным, так как React
следит за вызовом хуков.

## Примеры

### Запросы к API

Здесь `useFetch` -- это кастомный хук, который принимает URL в качестве аргумента и
возвращает объект с полями `data` и `loading`, указывающими на состояние запроса данных.
Внутри хука используется встроенный хук `useState` для управления состоянием и `useEffect`
для выполнения побочных эффектов (в данном случае, запроса данных через `fetch`).

```jsx
import { useState, useEffect } from 'react';

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return { data, loading };
}
```

### CRUD-операции

Кастомный хук `useMessages` предоставляет удобный API для работы с массивом сообщений. Он
позволяет управлять состоянием списка сообщений, включая их загрузку, добавление и
удаление. Хук использует библиотеку Axios для взаимодействия с сервером и
получения/отправки данных.

```jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

export default function useMessages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance('/messages')
      .then((res) => {
        setMessages(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addMessageHandler = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const res = await axiosInstance.post('/messages', formData);
    setMessages((prev) => [res.data, ...prev]);
  };

  const deleteHandler = async (messageId) => {
    const res = await axiosInstance.delete(`/messages/${messageId}`);
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  return {
    messages,
    isLoading,
    deleteHandler,
    addMessageHandler,
  };
}
```

- Хук возвращает объект с полями:
  - `messages`: Массив сообщений.
  - `isLoading`: Булевое значение, указывающее на состояние загрузки.
  - `addMessageHandler`: Функция для добавления нового сообщения.
  - `deleteHandler`: Функция для удаления сообщения по идентификатору.

### Auth

`useAuth` -- это кастомный хук, предназначенный для управления состоянием аутентификации
пользователя в React-приложении.

```jsx
import { useEffect, useState } from 'react';
import axiosInstance, { setAccessToken } from '../axiosInstance';

export default function useAuth() {
  const [user, setUser] = useState();

  useEffect(() => {
    axiosInstance('/tokens/refresh')
      .then((res) => {
        const { user: newUser, accessToken } = res.data;
        setUser(newUser);
        setAccessToken(accessToken);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const loginHandler = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    const res = await axiosInstance.post('/auth/login', formData);
    const { data } = res;
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const signupHandler = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    const res = await axiosInstance.post('/auth/signup', formData);
    const { data } = res;
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const logoutHandler = async () => {
    await axiosInstance('/auth/logout');
    setUser(null);
    setAccessToken('');
  };

  return {
    user,
    loginHandler,
    signupHandler,
    logoutHandler,
  };
}
```

- Хук возвращает объект с полями:
  - `user`: Текущий аутентифицированный пользователь
  - `loginHandler`: Обработчик отправки формы входа в аккаунт
  - `signupHandler`: Обработчик отправки формы регистрации нового аккаунта
  - `logoutHandler`: Функция выхода из аккаунта
