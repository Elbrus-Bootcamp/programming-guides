# Memoization guide

## Описание

_Мемоизация_ - это оптимизационная техника, используемая для уменьшения затрат времени на
вычисление результатов функций путем сохранения результатов выполнения функций и их
аргументов. В контексте React _мемоизация_ часто используется для оптимизации
производительности компонентов, чтобы избежать лишних вычислений и рендеринга.

## Примеры

### React.memo

Если происходит ререндер родительского компонента, то по умолчанию все дочерние компоненты
тоже повторно отрисовываются.

Компонент высшего порядка (Higher-order component) _React.memo_ позволяет не вызывать
ререндер компонента, если ни пропсы, ни состояние не изменялись.

_Пример_: изменение массива `posts` не приведёт к перерисовке всех карточек заново

```tsx
// Файл списка карточек
type ListCardsProps = { posts: PostType[] };

export default function ListCards({ posts }: ListCardsProps): JSX.Element {
  return (
    <div>
      {posts.map((post) => (
        <OneCard post={post} />
      ))}
    </div>
  );
}
```

```tsx
// Файл одной карточки
type OneCardProps = { post: PostType };

function OneCard({ post }: OneCardProps): JSX.Element {
  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </div>
  );
}

export default React.memo(OneCard);
```

### useCallback

Хук useCallback используется для мемоизации функций — сохранения ссылки на функцию между
рендерами, если её зависимости не изменились. Это полезно в ситуациях, когда функция,
создаваемая в компоненте, должна быть передана другому компоненту в качестве пропса. Без
useCallback эта функция будет создаваться заново при каждом рендере родительского
компонента, что может привести к ненужным перерисовкам дочерних компонентов.

_Пример_: колбэк `myHandler` не будет пересоздаваться при ререндере `ListCards`

```tsx
// Файл списка карточек
type ListCardsProps = { posts: PostType[] };

export default function ListCards({ posts }: ListCardsProps): JSX.Element {
  const myHandler = useCallback((): void => {
    /* какой-то код */
  }, []);
  return (
    <div>
      {posts.map((post) => (
        <OneCard post={post} myHandler={myHandler} />
      ))}
    </div>
  );
}
```

```tsx
// Файл одной карточки
type OneCardProps = { post: PostType; myHandler: () => void };

function OneCard({ post, myHandler }: OneCardProps): JSX.Element {
  return (
    <div>
      <button onClick={myHandler}>{post.title}</button>
      <p>{post.body}</p>
    </div>
  );
}

export default React.memo(OneCard);
```

<aside>
💡 Чтобы избежать излишних рендеров компонента карточки необходимо использовать `useCallback` и `React.memo` одновременно

</aside>

### useMemo

Хук useMemo в React используется для мемоизации любых ссылочных данных и вычислений в
компонентах. Этот хук позволяет предотвратить повторные вычисления в случаях, когда
результат вычислений зависит только от входных данных и не изменяется во время рендеринга
компонента. Также при использовании useMemo ссылка на переменную не будет создаваться
заново при каждом рендере родительского компонента, благодаря чем можно оптимизировать
перерисовки дочерних компонентов.

Пример: переменная `startDate` не будет пересоздаваться при ререндерах

```tsx
// Файл списка карточек
type ListCardsProps = { posts: PostType[] };

export default function ListCards({ posts }: ListCardsProps): JSX.Element {
  const startDate = useMemo(() => new Date(), []);
  return (
    <div>
      {posts.map((post) => (
        <OneCard post={post} myHandler={myHandler} startDate={startDate} />
      ))}
    </div>
  );
}
```

```tsx
// Файл одной карточки
type OneCardProps = { post: PostType; myHandler: () => void; startDate: Date };

function OneCard({ post, myHandler, startDate }: OneCardProps): JSX.Element {
  return (
    <div>
      <button onClick={myHandler}>{post.title}</button>
      <p>{post.body}</p>
      <p>Данные актуальны на {startDate.toLocaleString()}</p>
    </div>
  );
}

export default React.memo(OneCard);
```

<aside>
💡 Чтобы избежать излишних рендеров компонента карточки необходимо использовать `useMemo` и `React.memo` одновременно

</aside>
