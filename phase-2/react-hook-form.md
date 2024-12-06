### Пошаговая инструкция по использованию библиотеки `react-hook-form`

#### Что такое `react-hook-form`?

`react-hook-form — это библиотека для управления формами в React. Она обеспечивает простое, эффективное и производительное управление состоянием формы и валидацией, используя React-хуки. Основное преимущество библиотеки — минимизация рендеров компонентов и улучшение производительности при работе с большими формами.`

#### Для начала нужно установить библиотеку:

1. Установите библиотеку в проект:

   ```bash
   npm i react-hook-form
   ```

2. Если используете Material UI или React Bootstrap, добавьте их зависимости:
   ```bash
   npm i @mui/material @emotion/react @emotion/styled react-bootstrap bootstrap
   ```

---

### Основные функции `react-hook-form`

1. **`useForm`**: основной хук для управления формой.
2. **`register`**: регистрирует элементы формы для отслеживания.
3. **`handleSubmit`**: обрабатывает отправку формы.
4. **`watch`**: отслеживает изменения в полях.
5. **`setValue` / `getValues`**: для программного управления значениями.
6. **`reset`**: сброс формы до начального состояния.
7. **`trigger`**: вручную запускает валидацию.
8. **`formState`**: возвращает объект состояния формы (ошибки, статус отправки).

---

#### Рассмотрим эти ф-ции подробней:

#### **1. `useForm`**

Основной хук, используемый для инициализации формы. Возвращает функции и объекты для управления формой.

Пример:

```tsx
const { register, handleSubmit, watch, setValue, getValues, reset, trigger, formState } = useForm({
  defaultValues: { name: '', email: '' },
});
```

- **`defaultValues`**: начальные значения формы.
- **`mode`**: режим валидации (`onSubmit`, `onBlur`, `onChange`, `all`).

---

#### **2. `register`**

Регистрирует поле для отслеживания. Можно использовать с HTML-элементами или сторонними компонентами.

Пример:

```tsx
<input {...register('name', { required: 'Name is required' })} />
```

- **Опции валидации**:
  - `required`: обязательное поле.
  - `minLength` / `maxLength`: минимальная / максимальная длина.
  - `pattern`: регулярное выражение.
  - `validate`: кастомная функция валидации.

---

#### **3. `watch`**

Отслеживает изменения значений полей.

Пример:

```tsx
const watchedValue = watch('name'); // Отслеживает поле "name"
const allWatchedValues = watch(); // Отслеживает все поля
```

- Используется для динамического обновления интерфейса на основе текущего состояния полей.

---

#### **4. `setValue`**

Программно устанавливает значение поля.

Пример:

```tsx
setValue('name', 'John Doe');
setValue('email', 'example@mail.com', { shouldValidate: true });
```

- **Параметры**:
  - `name`: имя поля.
  - `value`: новое значение.
  - `options.shouldValidate`: выполнять ли валидацию при изменении.
  - `options.shouldDirty`: пометить ли поле как измененное.

---

#### **5. `getValues`**

Получает текущее значение поля или всех полей.

Пример:

```tsx
const nameValue = getValues('name'); // Получить значение конкретного поля
const allValues = getValues(); // Получить все значения формы
```

- Полезно для проверки состояния формы в произвольный момент времени.

---

#### **6. `reset`**

Сбрасывает форму до начальных значений.

Пример:

```tsx
reset(); // Сброс до defaultValues
reset({ name: 'John', email: 'john@example.com' }); // Установка новых значений
```

- Часто используется после успешной отправки формы.

---

#### **7. `handleSubmit`**

Обрабатывает отправку формы.

Пример:

```tsx
const onSubmit = (data) => console.log(data);
<form onSubmit={handleSubmit(onSubmit)} />;
```

- **`onSubmit`** получает объект со всеми данными формы.
- Автоматически предотвращает стандартное поведение браузера (`event.preventDefault()`).

---

#### **8. `formState`**

Объект, содержащий состояние формы.

Пример:

```tsx
const { errors, isDirty, isValid, isSubmitting, isSubmitSuccessful } = formState;
```

- **Свойства**:
  - `errors`: объект с ошибками валидации.
  - `isDirty`: флаг, указывающий, изменилось ли поле.
  - `isValid`: флаг, указывающий, прошла ли форма валидацию.
  - `isSubmitting`: флаг, указывающий, выполняется ли отправка.
  - `isSubmitSuccessful`: флаг успешной отправки.

---

#### **9. `trigger`**

Программно запускает валидацию.

Пример:

```tsx
trigger('email'); // Запускает валидацию поля "email"
trigger(); // Запускает валидацию всех полей
```

- Возвращает `true`, если валидация успешна.

---

#### **10. `setFocus`**

Устанавливает фокус на поле.

Пример:

```tsx
setFocus('name');
```

---

#### **11. `clearErrors`**

Очищает ошибки валидации.

Пример:

```tsx
clearErrors('name'); // Убирает ошибку у поля "name"
clearErrors(); // Убирает ошибки у всех полей
```

---

#### **12. `unregister`**

Удаляет поле из отслеживания.

Пример:

```tsx
unregister('name');
unregister(['name', 'email']); // Удаляет сразу несколько полей
```

---

#### **13. `isValid` и `dirtyFields`**

Часто используются из объекта `formState`.

Пример:

```tsx
const {
  formState: { isValid, dirtyFields },
} = useForm({
  mode: 'onChange', // Валидация выполняется при изменении
});

if (isValid) {
  console.log('Форма валидна');
}
console.log(dirtyFields); // Поля, которые были изменены
```

---

#### Полезные сценарии

1. **Динамическая валидация**

   ```tsx
   const validateUsername = async (username) => {
     const isAvailable = await fetch(`/api/username/${username}`);
     return isAvailable ? true : 'Username is taken';
   };

   <input
     {...register('username', {
       validate: validateUsername,
     })}
   />;
   ```

2. **Программное управление значениями**

   ```tsx
   const updateEmail = () => {
     setValue('email', 'newemail@example.com', { shouldValidate: true });
   };
   ```

3. **Условная логика с watch**

   ```tsx
   const role = watch('role');
   return role === 'admin' ? <AdminForm /> : <UserForm />;
   ```

4. **Работа с массивами (`useFieldArray`)**

   ```tsx
   const { fields, append, remove } = useFieldArray({
     control,
     name: 'items',
   });

   return (
     <>
       {fields.map((field, index) => (
         <div key={field.id}>
           <input {...register(`items.${index}.name`)} />
           <button onClick={() => remove(index)}>Remove</button>
         </div>
       ))}
       <button onClick={() => append({ name: '' })}>Add Item</button>
     </>
   );
   ```

Если требуется детализировать использование конкретного метода, дай знать!

---

### Пример на чистом HTML

```tsx
import { useForm } from 'react-hook-form';

function SimpleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name:</label>
        <input {...register('name', { required: 'Name is required' })} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <label>Email:</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <button type='submit'>Submit</button>
    </form>
  );
}

export default SimpleForm;
```

---

### Пример с React Bootstrap

1. Добавьте CSS Bootstrap в `index.html`:

   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" />
   ```

2. Используйте компоненты React Bootstrap:

```tsx
import { useForm } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';

function BootstrapForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control type='text' {...register('name', { required: 'Name is required' })} isInvalid={!!errors.name} />
        <Form.Control.Feedback type='invalid'>{errors.name?.message}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type='email'
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address',
            },
          })}
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type='invalid'>{errors.email?.message}</Form.Control.Feedback>
      </Form.Group>
      <Button type='submit' className='mt-3'>
        Submit
      </Button>
    </Form>
  );
}

export default BootstrapForm;
```

---

### Пример с Material UI

1. Добавьте компоненты Material UI:

```tsx
import { useForm } from 'react-hook-form';
import { TextField, Button } from '@mui/material';

function MaterialUIForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <TextField
          label='Name'
          variant='outlined'
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          margin='normal'
        />
      </div>
      <div>
        <TextField
          label='Email'
          variant='outlined'
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: 'Invalid email address',
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
          margin='normal'
        />
      </div>
      <Button variant='contained' color='primary' type='submit'>
        Submit
      </Button>
    </form>
  );
}

export default MaterialUIForm;
```

---

#### Пример реализации сложной формы, которая охватывает большую часть функционала `react-hook-form`.

```tsx
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { TextField, Button, Select, MenuItem, Checkbox, FormControlLabel, Box, Typography } from '@mui/material';

function ComplexForm() {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting, isValid, dirtyFields },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      terms: false,
      hobbies: [{ name: '' }],
      description: '',
    },
    mode: 'onBlur', // Валидация срабатывает при потере фокуса
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'hobbies',
  });

  const onSubmit = (data) => {
    console.log('Submitted Data:', data);
  };

  const watchedPassword = watch('password');

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 4 }}>
      <Typography variant='h4' gutterBottom>
        Пример сложной формы
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Имя */}
        <TextField
          {...register('firstName', { required: 'First Name is required' })}
          label='First Name'
          fullWidth
          margin='normal'
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />

        {/* Фамилия */}
        <TextField
          {...register('lastName', { required: 'Last Name is required' })}
          label='Last Name'
          fullWidth
          margin='normal'
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />

        {/* Email */}
        <TextField
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
          })}
          label='Email'
          type='email'
          fullWidth
          margin='normal'
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        {/* Пароль */}
        <TextField
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          label='Password'
          type='password'
          fullWidth
          margin='normal'
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        {/* Подтверждение пароля */}
        <TextField
          {...register('confirmPassword', {
            required: 'Confirm Password is required',
            validate: (value) => value === watchedPassword || 'Passwords do not match',
          })}
          label='Confirm Password'
          type='password'
          fullWidth
          margin='normal'
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        {/* Пол */}
        <Controller
          name='gender'
          control={control}
          rules={{ required: 'Please select your gender' }}
          render={({ field }) => (
            <Select {...field} fullWidth displayEmpty margin='normal' error={!!errors.gender}>
              <MenuItem value='' disabled>
                Select Gender
              </MenuItem>
              <MenuItem value='male'>Male</MenuItem>
              <MenuItem value='female'>Female</MenuItem>
              <MenuItem value='other'>Other</MenuItem>
            </Select>
          )}
        />
        {errors.gender && <Typography color='error'>{errors.gender.message}</Typography>}

        {/* Хобби */}
        <Typography variant='h6' mt={2}>
          Hobbies
        </Typography>
        {fields.map((item, index) => (
          <Box key={item.id} display='flex' alignItems='center' mt={1}>
            <TextField
              {...register(`hobbies.${index}.name`, { required: 'Hobby is required' })}
              label={`Hobby ${index + 1}`}
              margin='normal'
              error={!!errors.hobbies?.[index]?.name}
              helperText={errors.hobbies?.[index]?.name?.message}
              fullWidth
            />
            <Button variant='outlined' color='error' onClick={() => remove(index)} sx={{ ml: 2, mt: '8px' }}>
              Remove
            </Button>
          </Box>
        ))}
        <Button variant='contained' onClick={() => append({ name: '' })} sx={{ mt: 2 }}>
          Add Hobby
        </Button>

        {/* Условия использования */}
        <FormControlLabel
          control={<Checkbox {...register('terms', { required: 'You must accept terms' })} />}
          label='I accept the terms and conditions'
        />
        {errors.terms && <Typography color='error'>{errors.terms.message}</Typography>}

        {/* Описание */}
        <TextField {...register('description')} label='Description' multiline rows={4} fullWidth margin='normal' />

        {/* Кнопки управления */}
        <Box mt={2} display='flex' justifyContent='space-between'>
          <Button type='button' variant='outlined' onClick={() => reset()}>
            Reset
          </Button>
          <Button type='submit' variant='contained' color='primary' disabled={!isValid || isSubmitting}>
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default ComplexForm;
```

### Описание полей:

1. **Имя (`firstName`)** — обязательное текстовое поле.
2. **Фамилия (`lastName`)** — обязательное текстовое поле.
3. **Email** — обязательное текстовое поле с валидацией формата.
4. **Пароль (`password`)** — обязательное поле с минимальной длиной.
5. **Проверка пароля (`confirmPassword`)** — проверка на соответствие с `password`.
6. **Пол (`gender`)** — поле с выпадающим списком.
7. **Хобби (`hobbies`)** — динамический массив полей с возможностью добавления и удаления.
8. **Условия использования (`terms`)** — чекбокс с обязательной валидацией.
9. **Описание (`description`)** — необязательное текстовое поле с несколькими строками.

### Дополнительный функционал:

- Валидация с кастомными сообщениями.
- Динамическое управление массивами (`useFieldArray`).
- Программный сброс формы (`reset`).
- Использование `watch` для отслеживания выбранного значения (например, `password`).
- Если значение поля confirmPassword не совпадает с password, то выводится ошибка "Passwords do not match".
