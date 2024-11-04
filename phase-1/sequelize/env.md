# Гайд по env

## Описание

В данном гайде описано по шагам, как поднять базу данных с переменными окружения `.env` и
как описать подключение через них

## Как?

### 1. Установить зависимости

Помимо стандартных зависимостей для `sequelize` нужно установить ещё и пакет `dotenv`:

```
npm i dotenv sequelize pg pg-hstore && npm i -D sequelize-cli
```

### 2. Создать файл `.sequelizerc`

В пути к конифгурации поставить расширение `.js`:

```js
const path = require('path');

module.exports = {
  config: path.resolve('db', 'database.js'),
  'models-path': path.resolve('db', 'models'),
  'seeders-path': path.resolve('db', 'seeders'),
  'migrations-path': path.resolve('db', 'migrations'),
};
```

### 3. Выполнить инициализацию

```
npx sequelize-cli init
```

### 4. Поменять файл конфигурации

Зайдите в файл `database.js` и пропишите:

```js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    use_env_variable: process.env.DB_URL ? 'DB_URL' : undefined,
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};
```

Что это?

- `require('dotenv').config();` подключает переменные окружения в файл
- `process.env.DB_USER` вытаскивает переменную окружения `DB_USER`
- `use_env_variable: process.env.DB_URL ? 'DB_URL' : undefined` означает, что можно задать
  одну переменную окружения `DB_URL` и прописать туда ссылку подключения

### 5. Создать файлы `.env` и `.env.example`

В файл `.env` внести переменные среды

```
DB_USER=admin
DB_PASS=password123
DB_NAME=my-database
DB_HOST=127.0.0.1
DB_URL=postgresql://admin:password123@127.0.0.1:5432/my-database
```

В файл `.env.example` внести только ключи:

```
DB_USER=
DB_PASS=
DB_NAME=
DB_HOST=
DB_URL=
```
