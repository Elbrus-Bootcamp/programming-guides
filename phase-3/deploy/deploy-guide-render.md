# Деплой create-react-app приложения на Render с использованием базы данных Supabase

1. Настроить middleware `express.static` так, чтобы она 'смотрела' на папку `/client/build` или `frontend/build`(в зависимости от того, как называется у вас папка с React App):

```javascript
app.use(express.static(path.join(__dirname, '../../client/build')));
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
"postinstall": "cd backend && npm i && npx sequelize db:migrate:undo:all && npx sequelize db:migrate && npx sequelize db:seed:all && cd ../frontend && npm i && DISABLE_ESLINT_PLUGIN=true npm run build",
"start": "cd backend && npm start",
```

Первый скрипт запустится после того как Render при деплое вызовет `npm i` из корня твоего проекта. Этот скрипт установит npm-пакеты для клиента и сервера, пересоздаст таблицы БД, накатит сиды и сделает сборку твоего React-приложения. **ОСТОРОЖНО!** Каждую сборку все данные из БД будут полностью уничтожаться.

После того как render.com установит твоё приложение он запустит скрипт `start`

9. Выгрузить код в репозиторий GitHub
10. Зарегистрироваться на supabase.com и создать новую базу данных через `New project`. В поле Region выбираем "Frankfurt". Запомните пароль, который вводите. Дождитесь инициализации БД. .
11. Войти на render.com. Создаём новый веб-сервер (New -> Web Service). В поле Region выбираем "Frankfurt (EU)". Соединяем его с нашим репозиторием.
12. Выбираем ветку из которой будет собираться билд (Branch)
13. Build Command: `npm i`
14. Start Command: `npm start`
15. Вернёмся в Supabase. Переходим в `Project Settings` -> `Database` -> `Connection string` и копируем строку подключения, которая будет использоваться как переменная окружения `Enviroment variable` (**важно!** не забыть вписать пароль который использовался в форме проекта)
16. На render.com на странице настройки проекта открываем панель "Advanced" внизу и нажимем "Add Environment Variable". Там создаём переменную окружения `DATABASE_URL` и вставляем туда значение URL-адреса для подключения к базе данных supabase, которое мы скопировали. Также добавляем все переменные окружения (кроме PORT), которые необходимы для работы вашего приложения.
17. Если что-то идёт не так — смотрите логи деплоя, проверьте работоспособность ваших скриптов npm i и npm start. После выполнения миграции отслеживать изменения таблиц БД можно в разделе `Table editor` вашего проекта на Supabase.
18. Готово! Теперь каждый раз после пуша в выбранную ветку деплой будет происходить автоматически.


