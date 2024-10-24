# Деплой на Selectel с использованием Portainer (для управления контейнерами), Vite (frontend) и Express (backend)

0. Обработать все ошибки на клиенте и сервере, везде прописать `try/catch`

1. В файле `vite.config.ts` в корне клиентского проекта прописать исходящую директорию сборки на API
   сервер:

```js
export default defineConfig({
  ...
  build: {
      outDir: '../server/dist'
  },
  base: '/',
  ...
});
```

- Если используются `.env` на клиенте, то замените адрес API сервера на `/` - Можно проверить сборку
  приложения с помощью `npm run build` в директорию `dist` на сервере

2. Внести папку `dist` в `.gitignore` на API сервере
3. В сервере в файле `server.js` подключить модуль `path` и в конец эндпоинтов добавить строки:

```js
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});
```

4. Прописать скрипты (подготовка БД и запуск) в package.json:

```json
{
  "db:setup": "NODE_ENV=production npx sequelize db:migrate && NODE_ENV=production npx sequelize db:seed:all",
  "start": "NODE_ENV=production node src/server.js"
}
```

5. Прописать подключение к базе данных в режиме `production` и `development`. Лучше использовать
   различные переменные окружения: `DB_USER, DB_NAME, DB_PASS, DB_HOST` для `development` и
   `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD` для `production`. Например, так:

```js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    use_env_variable: process.env.DB_URL ? 'DB_URL' : undefined,
    dialect: 'postgres',
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASS_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    use_env_variable: process.env.DB_URL_PROD ? 'DB_URL_PROD' : undefined,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    dialect: 'postgres',
  },
};
```

6. Создаём репозиторий на Github и выделяем ветку под деплой. Пушим туда проект
7. Войди на [render.com](http://render.com/)
8. Создаём базу данных PostgreSQL: (New -> PostgreSQL). После создания БД копируем `Internal URL`
9. Создаём новый веб-сервер (New -> Web Service).

- Команда билда: `cd client && npm i && npm run build && cd ../server && npm i`
- Команда старта: `cd server && npm start`
- Добавляем внизу переменные окружения, которые используются в проекте.
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `DB_URL_PROD` и вставляем туда `Internal URL` из предыдущего пункта.

10. На локальном компьютере заполняем переменные окружения для `production` базы данных:

- Либо `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD`
- Либо `DB_URL_PROD` указываем, как в данных подключения `External URL`

11. Выполняем на локальном компе `npm run db:setup` для миграции и сидинга
