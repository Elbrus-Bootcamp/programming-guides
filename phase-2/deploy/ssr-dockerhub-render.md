Инструкция по деплою на Render.com docker-образа из DockerHub:

1. Установить пакет `npm i @babel/cli`
2. Отключить `morgan` и удалить его из зависимостей
3. Переименовать файл `Layout.jsx` в файл `Layout.js`
4. В настройке шаблонизатора заменить jsx на js:

```js
app.engine("js", jsxRender);
app.set("view engine", "js");
```

5. Проверить, что переменная окружения задания порта сервера называется `PORT`, а не `SERVER_PORT` или `EXPRESS_PORT`
6. Прописать отлов ошибок (`try/catch`), обработать все ошибки
7. Добавить два скрипта в package.json:

```json
{
  "build": "webpack && babel src --copy-files --out-dir distr",
  "start": "node distr/server.js"
}
```

8. Добавить в `.gitignore` всего, чего не хватает в списке:

```
node_modules/
sessions/
distr/
public/app.js
public/vendor.js
.env
```

9. Прописать подключение к Postgres через URL. Например, можно использовать такой файл `database.js`:

```js
require("dotenv").config();

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};
```

10. Прописать переменную окружения `DATABASE_URL` для подключения к базе данных из режима разработки. Подключение к базе данных будет происходить через `.env`:

```
DATABASE_URL=postgres://[имя пользователя]:[пароль]@[хост]:5432/[имя базы данных]
```

11. Перейти на [Render.com](https://render.com/) (создать учётную запись, если нет), создать базу данных PostgreSQL: указать название проекта, название базы данных, имя пользователя
12. После создания базы данных в разделе Info -> Connections найти Internal Database URL или External Database URL и вставить его в переменные окружения проекта

```
DATABASE_URL=[Database URL]
```

13. Накатить миграции и засидить БД в production. Например, можно добавить скрипт или написать в терминале:

```bash
NODE_ENV=production npx sequelize db:migrate && npx sequelize db:seed:all
```

14. Подготовить Docker. В корне проекта cоздать файл `.dockerignore` и прописать туда:

```
node_modules/
sessions/
distr/
public/app.js
public/vendor.js
.env
```

15. В корне проекта создать `Dockerfile` и описать образ. Например, так:

```dockerfile
FROM node:20-alpine3.17
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

15. В корне проекта выполнить `docker build . -t [имя образа]:[версия]` и затем проверить наличие созданного образа через `docker images`
16. Перейти на https://hub.docker.com/ (создать учётную запись, если нет)
17. https://hub.docker.com/settings/security создать `Access Token`
18. В терминале выполнить `docker login --username=[имя пользователя]`
19. Вместо пароля ввести `Access Token`
20. Создать репозиторий на Docker Hub
21. Добавить tag к образу: `docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]`
22. Отправить образ в Docker Hub: `docker push [имя пользователя]/[имя репозитория]:[имя тэга]` и проверить наличие образа через `docker images`
23. Вернуться на [Render.com](https://render.com/)
24. Перейти в `Account settings` и включить `Early Access` для возможности использования Docker
25. Создать новый веб-сервис и выбрать Docker, ввести имя сервиса
26. Ввести адрес репозитория в формате `docker.io/<username>/<repository>:<tag>`
27. В разделе Environment указать `Environment Variables` - те переменные окружения, которые указаны в `.env` -- в частности:

```
DATABASE_URL=[Database URL]
```
