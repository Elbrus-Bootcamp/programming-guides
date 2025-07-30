# Гайд по использованию библиотеки Zod

## Что такое Zod?

Zod — это библиотека для валидации данных, которая особенно удобна для TypeScript, но работает и с обычным JavaScript. Вы описываете структуру данных (схему), а Zod проверяет, соответствует ли ей ваш объект. Если данные валидны, вы получаете их в типобезопасном виде. Если нет — вы получите чёткие сообщения об ошибках.

Основные преимущества:
- **Простота**: интуитивно понятный синтаксис.
- **Типобезопасность**: автоматическое определение типов в TypeScript.
- **Компактность**: библиотека весит всего около 2 КБ (в сжатом виде).
- **Гибкость**: поддерживает сложные схемы и преобразования данных.
- **Без зависимостей**: работает сразу после установки.

## Установка

Чтобы начать использовать Zod, установите библиотеку через npm:

```bash
npm install zod
```

## Основы работы с Zod

### Создание схемы

Схема — это описание структуры данных. Например, вы хотите проверить, что объект содержит имя (строку) и возраст (число). Вот как это сделать:

```javascript
import * as z from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});
```

Здесь мы создали схему `UserSchema`, которая ожидает объект с двумя полями: `name` (строка) и `age` (число).

### Валидация данных

Чтобы проверить данные, используйте метод `.parse()`. Он возвращает данные, если они соответствуют схеме, или выбрасывает ошибку, если нет.

```javascript
const validData = { name: "Алексей", age: 25 };
const result = UserSchema.parse(validData);
console.log(result); // { name: "Алексей", age: 25 }

const invalidData = { name: "Алексей", age: "двадцать" };
UserSchema.parse(invalidData); // Ошибка: Invalid input: expected number
```

### Обработка ошибок

Если данные не прошли валидацию, метод `.parse()` выбросит объект `ZodError`. Чтобы обработать ошибки, используйте `try/catch`:

```javascript
try {
  UserSchema.parse({ name: "Алексей", age: "двадцать" });
} catch (err) {
  if (err instanceof z.ZodError) {
    console.log(err.issues);
    // [
    //   {
    //     code: 'invalid_type',
    //     expected: 'number',
    //     path: ['age'],
    //     message: 'Invalid input: expected number'
    //   }
    // ]
  }
}
```

Альтернатива — метод `.safeParse()`, который не выбрасывает ошибку, а возвращает объект с результатом:

```javascript
const result = UserSchema.safeParse({ name: "Алексей", age: "двадцать" });
if (!result.success) {
  console.log(result.error.issues);
  // То же самое, что выше
} else {
  console.log(result.data); // Данные, если валидация прошла
}
```

## Основные типы данных в Zod

Zod поддерживает множество встроенных типов. Вот самые популярные:

### 1. Примитивные типы

- **Строка**: `z.string()`
- **Число**: `z.number()`
- **Булево**: `z.boolean()`
- **Null**: `z.null()`
- **Undefined**: `z.undefined()`

Пример:

```javascript
const schema = z.object({
  username: z.string(),
  score: z.number(),
  isActive: z.boolean(),
  details: z.null(),
});

schema.parse({
  username: "player1",
  score: 100,
  isActive: true,
  details: null,
}); // OK
```

### 2. Объекты

Для проверки сложных объектов используйте `z.object()`:

```javascript
const ProfileSchema = z.object({
  name: z.string(),
  age: z.number(),
  address: z.object({
    city: z.string(),
    zip: z.number(),
  }),
});

ProfileSchema.parse({
  name: "Анна",
  age: 30,
  address: { city: "Москва", zip: 123456 },
}); // OK
```

### 3. Массивы

Для массивов используйте `z.array()`:

```javascript
const NumbersSchema = z.array(z.number());

NumbersSchema.parse([1, 2, 3]); // OK
NumbersSchema.parse([1, "2", 3]); // Ошибка: expected number
```

### 4. Необязательные и значения по умолчанию

- **Необязательное поле**: `.optional()`
- **Значение по умолчанию**: `.default(value)`

```javascript
const UserSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  role: z.string().default("user"),
});

UserSchema.parse({ name: "Иван" }); // { name: "Иван", role: "user" }
```

### 5. Объединения (Union)

Для проверки данных, которые могут быть одного из нескольких типов, используйте `z.union()`:

```javascript
const IdSchema = z.union([z.string(), z.number()]);

IdSchema.parse("abc123"); // OK
IdSchema.parse(123); // OK
IdSchema.parse(true); // Ошибка
```

### 6. Перечисления (Enum)

Для ограниченного набора значений используйте `z.enum()`:

```javascript
const RoleSchema = z.enum(["admin", "user", "guest"]);

RoleSchema.parse("admin"); // OK
RoleSchema.parse("manager"); // Ошибка
```

### 6. Даты (Date)

Тип z.`date()` используется для валидации объектов Date:

```javascript
const EventSchema = z.object({
  name: z.string(),
  eventDate: z.date(),
});
EventSchema.parse({ name: "Party", eventDate: new Date() }); // OK
```

## Дополнительные методы валидации

Zod позволяет уточнять правила валидации с помощью методов:

### 1. Проверка длины строки

```javascript
const PasswordSchema = z.string()
  .min(8, "Пароль должен быть минимум 8 символов")
  .max(20, "Пароль не может быть длиннее 20 символов");

PasswordSchema.parse("mysecret"); // Ошибка: Пароль должен быть минимум 8 символов
```

### 2. Проверка чисел

```javascript
const AgeSchema = z.number()
  .min(18, "Возраст должен быть не менее 18")
  .max(120, "Возраст не может быть больше 120");

AgeSchema.parse(25); // OK
AgeSchema.parse(15); // Ошибка: Возраст должен быть не менее 18
```

### 3. Пользовательские проверки с `.refine()`

Метод `.refine()` позволяет добавить свои правила валидации:

```javascript
const UserSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

UserSchema.parse({
  password: "secret123",
  confirmPassword: "secret123",
}); // OK

UserSchema.parse({
  password: "secret123",
  confirmPassword: "different",
}); // Ошибка: Пароли не совпадают
```

### 4. Преобразование данных с `.transform()`

Метод `.transform()` позволяет изменять данные после валидации:

```javascript
const StringToNumberSchema = z.string().transform((val) => parseInt(val, 10));

StringToNumberSchema.parse("123"); // 123 (число)
```

## Асинхронная валидация

Если валидация требует асинхронных операций (например, запрос к API), используйте `.refine()` с асинхронной функцией и метод `.parseAsync()`:

```javascript
const UsernameSchema = z.string().refine(async (username) => {
  // Имитация проверки в базе данных
  const isTaken = await fakeApiCheck(username);
  return !isTaken;
}, {
  message: "Имя пользователя уже занято",
});

async function fakeApiCheck(username) {
  return username === "admin"; // Пример
}

await UsernameSchema.parseAsync("user1"); // OK
await UsernameSchema.parseAsync("admin"); // Ошибка: Имя пользователя уже занято
```

## Работа с TypeScript

Zod автоматически генерирует типы на основе схемы. Используйте `z.infer` для извлечения типа:

```javascript
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;

const user: User = { name: "Алексей", age: 25 }; // Типобезопасно
```

## Полезные советы

1. **Иммутабельность**: Все методы Zod возвращают новую схему, не изменяя исходную.
2. **JSON Schema**: Zod может конвертировать схемы в JSON Schema для использования в других инструментах.
3. **Экосистема**: Zod интегрируется с библиотеками вроде React Hook Form, tRPC и другими.

## Пример: Форма регистрации

Вот пример, как использовать Zod для валидации формы регистрации:

```javascript
import * as z from "zod";

const RegisterSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
  age: z.number().min(18, "Вы должны быть старше 18"),
  roles: z.array(z.enum(["user", "admin"])).min(1, "Выберите хотя бы одну роль"),
}).refine((data) => data.password !== data.email, {
  message: "Пароль не должен совпадать с email",
  path: ["password"],
});

const formData = {
  email: "user@example.com",
  password: "secure123",
  age: 25,
  roles: ["user"],
};

const result = RegisterSchema.safeParse(formData);
if (result.success) {
  console.log("Данные валидны:", result.data);
} else {
  console.log("Ошибки валидации:", result.error.issues);
}
```

## Заключение

Для более глубокого изучения посетите официальную документацию: [zod.dev](https://zod.dev).
