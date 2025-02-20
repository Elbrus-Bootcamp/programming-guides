# Loader (ожидание загрузки данных)

Состояние для фиксации того, что данные загружаются (true) или  уже загрузились (false)

```jsx
const [loading, setLoading] = useState(true);
```

Условный рендеринг для ввода лоадера

```jsx
  <>
      {
        loading ? (
        <div className="loader"></div>
      ) : (
        <div className="content">Данные загружены</div>
      )
      }
    </>
```

Пример использования (эмулируем загрузку данных через timeout)

```jsx
 useEffect(() => {
    // Эмулируем ожидание данных
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  });

```

Стили для красоты:

```css
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

```