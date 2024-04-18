# Деплой create-react-app приложения на Heroku (вариант с подключением GitHub-репозитория к Heroku)

1. Настроить middleware `express.static` так, чтобы она 'смотрела' на папку `/frontend/build`:

```javascript
app.use(express.static(path.join(__dirname, '../../frontend/build')));
```

2. Удалить лишние папки `.git` из папок `server/backend` и `client/frontend`
3. Сделать билд/сборку фронтенда у себя на localhost `cd frontend && npm run build`
4. Проверить работоспособность production билда/сборки (зайти на `localhost:4000`)
5. Прописать роут '\*', который будет на все необработанные url отдавать `index.html` (вставляется после всех остальных роутов). Это нужно, чтобы сервер мог отдавать ваше приложение не только по корневому url `"/"`, но и по внутренним url типа `"/todos/1"`, `"/auth/register"` и т.д.

```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

6. `database.json` должен выглядеть таким образом:

```json
{
  "development": {
    "use_env_variable": "DATABASE_URL"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialectOptions": {
      "ssl": {
        "rejectUnauthorized": false
      }
    }
  }
}
```

7. Нужно использовать `process.env.PORT` в качестве порта для сервера express
8. Создать файл `package.json` (`npm init -y`) в корне и записать в него скрипты.

```json
"postinstall": "cd backend && npm i && npx sequelize db:migrate && cd ../frontend && npm i && DISABLE_ESLINT_PLUGIN=true npm run build",
"start": "cd backend && npm start",
```

Первый скрипт запустится после того как Heroku при деплое вызовет `npm i` из корня твоего проекта. Этот скрипт установит npm-пакеты для клиента и сервера, накатит миграции БД и сделает сборку твоего React-приложения.

После того как Heroku установит твоё приложение он запустит скрипт `start`

9. Выгрузить код в репозиторий GitHub
10. Зайти на Heroku, создать приложение
11. Подключить postgres к Heroku (Resource -> postgress add-on)
12. Идём в Deploy, коннектим github-репозиторий, разрешаем автоматические билды (Enable Automatic Deploys), делаем билд вручную (Deploy Brunch)
13. Установить heroku-cli (https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)
14. Пройти аутентификацию heroku-cli (`heroku auth:2fa` в командной строке)
15. Засеять БД (`<app-name>` - имя вашего приложения на Heroku).

```bash
heroku run "cd backend && npx sequelize db:seed:all" -a <app-name>
```

Используй такой синтаксис если тебе понадобиться запускать команды в командной строке на сервере Heroku.

16. Готово! Теперь каждый раз после пуша в выбранную ветку деплой будет происходить автоматически.
