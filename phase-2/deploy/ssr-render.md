Инструкция по деплою на Render.com

1. Установить пакет `npm i @babel/cli`
2. Отключить `morgan` и удалить его из зависимостей
3. Переименовать файл `Layout.jsx` в файл `Layout.js`
4. В настройке шаблонизатора заменить jsx на js:

```js
app.engine("js", jsxRender);
app.set("view engine", "js");
```

5. Прописать отлов ошибок (`try/catch`), обработать все ошибки
6. Создать базу данных на [supabase](https://app.supabase.com/) (создать учётную запись, если нет)
7. Перейти в Settings -> Database -> Connection info найти данные для подключения к удалённой базе данных.
8. Прописать переменные окружения в `db/config/database.js` в часть `production`
9. Накатить миграции и засидить БД в production. Например, можно добавить скрипт или написать в терминале:

```bash
NODE_ENV=production npx sequelize db:migrate && npx sequelize db:seed:all
```

10. Добавить два скрипта в package.json:

```json
{
  "build": "webpack && babel src --copy-files --out-dir distr",
  "start": "node distr/server.js"
}
```

11. Добавить папку distr в `.gitignore`
12. Запушить код в новый или уже созданный репозиторий GitHub
13. Перейти на [Render.com](https://render.com/) (создать учётную запись, если нет), создать Web Service и указать нужный репозиторий
14. Добавить команды `npm i && npm run build` для сборки и `npm start` для старта
15. В разделе Environment указать `Environment Variables` - те переменные окружения, которые указаны в `.env`
16. Сверху нажать на Manual deploy -> Deploy latest commit
