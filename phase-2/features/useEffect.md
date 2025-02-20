# useEffect

[Читайте подробнее в официальной документации](https://react.dev/reference/react/useEffect)

## 1. **Бесконечный цикл**

Этот пример иллюстрирует важность правильного указания зависимостей в `useEffect`. Без
указания зависимостей эффект будет срабатывать после каждого рендера, что приводит к
бесконечному увеличению счётчика.

### Описание:

```jsx
import React, { useEffect, useState } from 'react';

export default function App() {
  const [value, setValue] = useState(''); // Состояние для хранения введённого текста
  const [count, setCount] = useState(-1); // Счётчик изменений
  useEffect(() => setCount(count + 1)); // Каждый рендер увеличивает счётчик
  const onChange = ({ target }) => setValue(target.value); // Обновляет текстовое поле
  return (
    <div>
      <input type="text" value={value} onChange={onChange} />
      <div>Количество изменений: {count}</div>
    </div>
  );
}
```

- **Проблема:** `useEffect` без зависимостей вызывает бесконечный цикл рендеров, так как
  при каждом изменении состояния происходит новый рендер, что вызывает перезапуск эффекта.
  Это приводит к постоянному обновлению счётчика.
- **Решение:** Добавить массив зависимостей, чтобы эффект выполнялся только при изменении
  нужных данных.

## 2. **Очистка интервала**

Пример демонстрирует, как можно использовать `useEffect` для создания и очистки
интервалов. Здесь создаётся таймер, который каждую секунду увеличивает счётчик.

### Описание:

```jsx
export default function Timer() {
  const [counter, setCounter] = useState(0); // Счётчик секунд
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCounter((prev) => prev + 1); // Каждую секунду увеличиваем счётчик
    }, 1000);
    return () => clearInterval(intervalId); // Очистка интервала при размонтировании
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании
  return <div>Seconds passed: {counter}</div>;
}
```

- **Особенность:** Этот эффект срабатывает один раз при монтировании компонента и
  запускает интервал. Возвращаемая функция очищает интервал при размонтировании
  компонента, что предотвращает утечки памяти.

## 3. **Использование AbortController**

Пример демонстрирует, как отменить асинхронные запросы с использованием `AbortController`.
Это полезно, когда компонент размонтируется до завершения запроса.

### Описание:

```jsx
export default function FetchAbort() {
  useEffect(() => {
    const controller = new AbortController(); // Создание контроллера для отмены запроса
    const { signal } = controller;
    fetch('https://jsonplaceholder.typicode.com/todos/1', { signal }) // Запрос с поддержкой отмены
      .then((res) => res.json())
      .catch(console.log); // Ловим ошибки, в том числе отмену запроса
    return () => controller.abort(); // Отмена запроса при размонтировании компонента
  }, []); // Эффект выполняется один раз при монтировании
  return <div>FetchAbort</div>;
}
```

- **Особенность:** Этот эффект создаёт запрос с возможностью его отмены. Когда компонент
  размонтируется, запрос будет отменён, что позволяет избежать потенциальных ошибок и
  конфликтов при обновлении состояния после завершения запроса.

## 4. **Debounce при поиске**

Пример показывает, как использовать `useEffect` для создания задержки (debounce) при
выполнении поискового запроса. Ввод текста в поисковое поле вызывает эффект только после
того, как пользователь прекратит ввод на 1 секунду.

### Описание:

```jsx
const [searchedText, setSearchedText] = useState(''); // Состояние для текста поиска
const [searchedPosts, setSearchedPosts] = useState([]); // Результаты поиска

useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (searchedText.length > 0) {
      axios('/api/post/search', { params: { text: searchedText } }).then((res) =>
        setSearchedPosts(res.data),
      ); // Выполняем поиск по введённому тексту
    }
  }, 1000); // Ожидаем 1 секунду перед выполнением запроса
  return () => clearTimeout(timeoutId); // Очищаем таймер при изменении текста
}, [searchedText]); // Эффект срабатывает при изменении текста поиска
```

- **Особенность:** Этот пример иллюстрирует технику дебаунса, которая позволяет уменьшить
  количество запросов к серверу, выполняя поиск только после завершения ввода. Таймер
  сбрасывается при каждом изменении текста, предотвращая выполнение запросов при быстром
  вводе текста.

## 5. **Поиск, отраженный в query-параметре**

Пример показывает, как комбинировать `useEffect` и `useSearchParams` в функционале поиска
так, чтобы текст поиска был отражён в адресной строке страницы. В роли состояния для
текстового поля `<input />` выступает URL адресной строки.

```jsx
function SearchComponent() {
  const [posts, setPosts] = useState([]); // Результаты поиска
  const [queryParams, setQueryParams] = useSearchParams(); // Query-параметры адресной строки
  const search = queryParams.get('search') || ''; // получение строки поиска из URL

  useEffect(() => {
    if (search === '') return; // при пустом поиске ничего не делать

    axios.get(`/api/posts`, { params: { search } }).then((res) => setPosts(res.data));
  }, [search]);

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearchParams({ search: e.target.value })}
      />
      {posts.map((post) => (
        <PostItem post={post} />
      ))}
    </>
  );
}
```

## 6+. **Поиск, отраженный в query-параметре + debounce**

Пример показывает, как комбинировать поиск, отраженный в URL вместе с debounce

```jsx
const [posts, setPosts] = useState([]); // Результаты поиска
const [queryParams, setQueryParams] = useSearchParams(); // Query-параметры адресной строки

const searchValue = queryParams.get('search') || ''; // получение строки поиска из URL
const [text, setText] = useState(searchValue); // Состояние для текста поиска

useEffect(() => {
  if (value === '') return; // при пустом поиске ничего не делать

  const id = setTimeout(() => {
    setSearchParams({ search: text }); // заменить URL

    axios
      .get(`/api/posts`, {
        params: {
          search: text,
        },
      })
      .then((res) => setPosts(res.data));
  }, 500);
  return () => clearTimeout(id);
}, [text]);
```
