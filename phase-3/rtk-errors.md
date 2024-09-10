## Обработка ошибок в Redux Toolkit

### Код на сервере

На сервере обязательно возвращай нужный статус и сообщение об ошибке:

```js
authRouter.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const existingUser = await User.findOne({ where: { name } });

  // проверяем, что такой пользователь есть в БД и пароли совпадают
  if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
    // кладём id нового пользователя в хранилище сессии (логиним пользователя)
    req.session.userId = existingUser.id;
    req.session.user = existingUser;
    res.json({ id: existingUser.id, name: existingUser.name });
  } else {
    // вовращаем 401 статус и сообщение об ошибки
    res.status(401).json({ error: 'Такого пользователя нет либо пароли не совпадают' });
  }
});
```

### Обработка ошибок на клиенте в Redux Toolkit

1. Добавь ошибку в тип стейта. Если разные виды ошибок — лучше используй уникальные ключи
   для каждой ошибки:

```ts
type AuthState = {
  authChecked: boolean;
  user?: User;
  loginFormError?: string;
  registerFormError?: string;
};
```

2. Когда получаешь ответ от сервера — обязательно проверь, какой статус пришёл, и брось
   ошибку при необходимости:

```ts
// src/features/auth/api.ts

export async function login(credentials: Credentials): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // кидаем ошибку, если вернулся ошибочный статус
  if (!res.ok) {
    const { error } = await res.json();
    throw error;
  }

  return res.json();
}
```

3. Добавь обработку этой ошибки — напиши addCase у builder c состоянием rejected внутри
   слайса:

```js
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        //обнуляем ошибку, потому что авторизация успешно прошла
        state.loginFormError = undefined;
      })
      // вот так изменится стэйт если вернулась ошибка
      .addCase(login.rejected, (state, action) => {
        state.loginFormError = action.error.message;
      });
  };
})
```

4. Вот так можно отображать ошибку в интерфейсе:

```tsx

function Login(): JSX.Element {

  const error = useSelector((state: RootState): string | undefined =>
  state.auth.loginFormError);

  ...

  return  return (
    <form onSubmit={handleSubmit}>
      <h2>Вход</h2>
      {error && (
        <div>
          {error}
        </div>
      )}
        <label>
          Имя
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
          />
        </label>
        ...
      <button type="submit">
        Войти
      </button>
    </form>
  );
}
```

5. Добавь обычный редьюсер в слайс для сброса ошибки:

```js
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // редьюсер для очистки ошибки
    resetLoginFormError: (state) => {
      state.loginFormError = undefined;
    },
  },
  extraReducers: (builder) => {
   ....
  }
});

// экспортируем экшн-криэйтор
export const { resetLoginFormError } = authSlice.actions;

```

и можно теперь сбрасывать эту ошибку в компонентах при необходимости:

```tsx

function Login(): JSX.Element {

  const dispatch = useAppDispatch();
  const error = useSelector(selectLoginFormError);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // как только пользователь начал что-то вводить ...
    setName(event.target.value);
    // ... очищаем ошибку
    dispatch(resetLoginFormError());
  };

  return  return (
    <form onSubmit={handleSubmit}>
      <h2>Вход</h2>
      {error && (
        <div>
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name-input">
          Имя
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
          />
        </label>
        ...
      <button type="submit">
        Войти
      </button>
    </form>
  );
}
```

### Валидация данных на клиенте

Проверку на пустые поля или правильность формата данных лучше делать на клиентской стороне
— так мы быстрее сообщим пользователю о его ошибке и снизим нагрузку на сервер.

Например, вот так:

```ts

// src/features/auth/types/Credentials.ts

type Credentials {
  name: string;
  password: string;
}

// src/features/auth/authSlice.ts

export const login = createAsyncThunk('auth/login', async (credentials: Credentials) => {
// сначала мы проверяем, заполнены ли все поля
  if (!credentials.name.trim() || !credentials.password.trim()) {
// и если нет — бросаем ошибку (она попадает в  builder.addCase(login.rejected, ...)
    throw new Error('Не все поля заполнены');
  }

// если все хорошо — отправляем запрос на сервер
  return api.login(credentials);
});
```

_Любите свои ошибки, обращайтесь с ними внимательно, и будет вашему приложению счастье 💓_
