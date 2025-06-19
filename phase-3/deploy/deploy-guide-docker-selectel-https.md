# Деплой на Selectel, HTTPS, Vite (frontend) и Express (backend)

## Сборка приложения

### Билд клиентского приложения (Vite)

1. Обработать и решить все ошибки Typescript.
   Ошибку Typescript о неиспользуемых параметрах в функциях (как, например, в
   `reducers`), можно отключить в файле `tsconfig.json`, прописав поля `"noUnusedLocals": false` и `"noUnusedParameters": false`.
2. В файле `vite.config.ts` в корне клиентского проекта прописать исходящую директорию
   сборки на API сервер:

```js
export default defineConfig({
  ...
  build: {
      outDir: '../server/src/public/dist'
  },
  base: '/',
  ...
});
```

3. В `.env` клиента заменить адрес API сервера на `/api` (так как в будущем приложение будет
   раздаваться с API сервера)
4. Выполнить `npm run build` для сборки клиентского приложения (он выполнится в директорию
   `dist` на API сервере)
5. Внести папку `dist` в `.gitignore` на API сервере
6. В API сервере В файле конфигурации сервера (`src/config/serverConfig.js`):

```javascript
app.use(express.static(path.join(__dirname, "..", "public", "dist")));
```

В главном файле сервера В КОНЦЕ ВСЕХ МАРШРУТОВ (`src/app.js`):

```javascript
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});
```

# Для Express 5._ версий вместо пути `*` нужно использовать `/.*/` ИЛИ `/{*splat}`

```js
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "indehtml"));
});
```

ИЛИ

```js
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});
```

Добавить импорт `path` в начало `app.js`:

```js
const path = require("path");
```

7. Необходио удостовериться, что при запуске сервера мы слушаем только порт и нет второго параметра (хоста), либо должен стоять хост 0.0.0.0

8. **Запустить сервер и проверить работу проекта в браузере**

### Контейнеризация сервера (Docker)

1. Прописать отлов ошибок `try/catch` на каждом эндпоинте сервера, обработать все ошибки.
2. Добавить в `.gitignore` на сервере всего, чего не хватает в списке:

```
node_modules/
dist/
.env
```

3. Прописать скрипты (подготовка БД и запуск проекта) в package.json:

```json
{
  "db:setup": "NODE_ENV=production sequelize db:create && NODE_ENV=production sequelize db:migrate && NODE_ENV=production sequelize db:seed:all",
  "db:setup:prod": "NODE_ENV=production npx sequelize db:migrate",
  "start": "NODE_ENV=production node src/app.js"
}
```

4. Прописать подключение к базе данных в режиме `production` и `development`.
   DB_URL_PROD - подключение к удаленной базе данных

```js
{
  "development": {
    "use_env_variable": "DB_URL_PROD"
  },
  "test": {
    "use_env_variable": "DATABASE_URL"
  },
  "production": {
    "use_env_variable": "DB_URL_PROD"
  }
}
```

5. В корневой папке сервера создать файл `.dockerignore` и прописать туда:

```
node_modules/
.env
```

6. В корневой папке сервера создать файл `Dockerfile` и описать образ. Например, так:

```Dockerfile
FROM node:22-alpine3.19
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3000
RUN npm ci --omit=dev
CMD ["npm", "start"]
```

7. В корне сервера выполнить `docker build . -t [имя образа]:[версия]` и затем проверить
   наличие созданного образа через `docker images`
   1. например, на api сервере `docker build . -t myproject:1.0`
   2. если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
      например `docker build . -t myproject:1.0 --platform linux/amd64`
      Проверить работу приложения, запущенного в контейнере, вставив DB_URL_PROD **значение** из .env сервера:

```bash
docker run -d \
 -p 3000:3000 \
 -e DB_URL_PROD="[значение из файла .env сервера]" \
 -e PORT=3000 \
 -e SECRET_ACCESS_TOKEN="[SECRET_ACCESS_TOKEN]" \
 -e SECRET_REFRESH_TOKEN="[SECRET_REFRESH_TOKEN]" \
 -e CLIENT_URL="http://localhost:5173" \
 -e API_KEY="8iuregjr3rgjr" \
 --name tasks \
 [ID образа]
```

*tasks - название контейнера
*API_KEY - переменная окружения для API ключа (если есть)

8. Перейти на https://hub.docker.com/ (создать учётную запись, если нет или зайти под учётной записью github)
9. https://hub.docker.com/settings/security создать `Access Token`
10. В терминале выполнить `docker login --username=[имя пользователя]`
11. Вместо пароля ввести `Access Token`
12. Создать репозиторий на Docker Hub
13. Добавить tag к образу:
    `docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]`
    1. например, на api сервере `docker tag myproject:1.0 myusername/myrepo:1.0`
14. Отправить образ в Docker Hub:
    `docker push [имя пользователя]/[имя репозитория]:[имя тэга]` и проверить наличие
    образа через `docker images`

15. Если возникнет ошибка
    `failed to authorize: failed to fetch oauth token: unexpected status from GET request to https://auth.docker.io/token?.........&service=registry.docker.io: 401 Unauthorized`
    тогда может помочь очистка кэша авторизации. Нужно выполнить команду
    `rm ~/.docker/config.json` затем `docker login`. В терминале появится сообщение с
    кодом и ссылкой, где этот код нужно ввести, например:

    ```bash
      Your one-time device confirmation code is: MMXK-KQNN
      Press ENTER to open your browser or submit your device code here: https://login.docker.com/activate
    ```

## Selectel

1. Перейти на сайт https://selectel.ru/ и зарегистрировать новый аккаунт
2. Подтвердить на почте, заполнить необходимые данные (ФИО, телефон)
3. Нажимаем на баланс аккаунт -> Активировать промокод
4. Переходим в "Облачная платформа" -> "Серверы" -> Создать сервер
   1. Если внизу написано пополнить баланс, то выходим из аккаунта и перезаходим заново
5. Настраиваем конфигурацию по желанию. Рекомендуемые настройки:
   1. OS: Ubuntu 20.04 LTS
   2. 1 vCPU, 1 GB RAM (зависит от вашего приложения)
   3. Память: Базовый SSD 8 GB (зависит от вашего приложения)
   4. Сеть: подсеть -> Новый публичный IP-адрес
6. **Сохраняем пароль к root пользователю в безопасном месте**

## Domain

8. После создания сервера копируем публичный IP, переходим на https://freedns.afraid.org/
   и регистрируемся там для получения доменого имени 3го уровня
   1. Во время регистрации поле userID это никнейм
   2. После регистрации подтверждаем почту
9. Переходим в раздел `Subdomains` и создаём новый субдомен
10. Выбираем `type A`
11. Прописываем желаемый субдомен
12. Вставляем внешний IP из Selectel
13. Можно пропинговать домен. Команды `ping [домен]` и `ping [твой ip]` должны работать
    одинаково

## Настройка виртуального сервера

1. Открываем терминал и подключаемся через SSH `ssh root@[внешний ip адрес]`, вводим yes чтобы добавить IP сервера в разрешённые и вводим пароль root пользователя (возможно, сработает со 2 раза)

*ОПЦИОНАЛЬНО*: Создать пользователя, отличного от root через `adduser [имя пользователя]`. Например:
`adduser elbrus`, прописываем ему пароль и необходимые другие данные
Добавить созданного пользователя в sudoers:

1.  вводим `visudo`
2.  прописываем права в файле `[имя пользователя] ALL=(ALL:ALL) ALL`
3.  Выходим из файла (ctrl+x yes enter)
    Переключаемся на созданного пользователя `su - [имя пользователя]`, например
    `su - elbrus`

### Настраиваем Docker на виртуальном сервере

1. Устанавливаем Docker

Обновление пакетов на сервере

- Выполнить обновление списка пакетов и установленных пакетов на удаленном сервере.

```bash
apt update
```

Установка Docker

- Выполнить установку Docker на удаленном сервере.

```bash
apt install docker.io
```

### Если вы не используете в проекте облачную базу данных, то для подключения БД необходимо установить PostgreSQL на виртуальном сервере.

Стягивание Docker-образа PostgreSQL

- Стянуть Docker-образ PostgreSQL на виртуальном сервере.

```bash
docker pull postgres
```

Запуск docker-контейнера с postgres

- Запустить docker-контейнер с postgres на виртуальном сервере. Убедитесь, что порт 5432 доступен для вашего сервера.

```bash
docker run --name some-postgres \
  -e POSTGRES_PASSWORD=[СЛОЖНЫЙ ПАРОЛЬ] \
  -e POSTGRES_USER=elbrus \
  -e POSTGRES_DB=elbrus \  # добавляем явное имя БД (опционально)
  -e DB_URL_PROD="postgresql://elbrus:[СЛОЖНЫЙ ПАРОЛЬ]@localhost:5432/elbrus" \
  -p 5432:5432 \
  -d postgres
# Проверяем, запустился ли контейнер с PostgreSQL.
docker ps
```

#### Накатить новую базу с ЛОКАЛЬНОЙ машины на ВИРТУАЛЬНЫЙ сервер

#### В локальном терминале сервера выполнить:

```bash
npm run db:setup
```

### Установка Nginx на виртуальном сервере

- **Что такое Nginx?** Nginx (произносится как "энджинкс") — это высокопроизводительный веб-сервер и обратный прокси-сервер. В данном случае он будет принимать входящие запросы по HTTP/HTTPS и перенаправлять их на ваше приложение, запущенное в Docker контейнере.

- Установите Nginx.

```bash
apt install nginx -y
```

### Настройка Nginx (проксирование всего трафика на бэкенд)

- Создайте конфигурационный файл Nginx для вашего домена. Например, `/etc/nginx/sites-available/[ВАШ_ДОМЕН]`.
- Отредактируйте файл, используя текстовый редактор типа `nano` или `vim`.

```bash
nano /etc/nginx/sites-available/[ВАШ_ДОМЕН]
```

- Вставьте следующее содержимое (замените `ВАШ_ДОМЕН` на свои значения; ВНУТРЕННИЙ _ПОРТ_ ПРИЛОЖЕНИЯ - это порт на хост-машине, куда проброшен порт контейнера, например, 3000):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ВАШ_ДОМЕН;

    location / {
      proxy_pass http://localhost:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Выход с сохранением из nano:

```bash
ctrl+x
ctrl+y
enter
```

- Активируйте конфигурацию, создав символическую ссылку для ВАШЕГО ДОМЕНА:

```bash
ln -s /etc/nginx/sites-available/[ВАШ ДОМЕН] /etc/nginx/sites-enabled/
```

- Проверьте синтаксис конфигурации Nginx и перезагрузите его:

```bash
nginx -t
systemctl reload nginx
```

### Установка Certbot и получение SSL-сертификата

- **Что такое Certbot?** Certbot — это утилита, которая автоматизирует процесс получения и установки бесплатных SSL/TLS сертификатов от Let's Encrypt. Сертификаты нужны для включения HTTPS и шифрования трафика между пользователем и сервером.

- Установите Certbot и плагин Nginx для автоматической настройки.

```bash
apt install certbot python3-certbot-nginx -y
```

- Запустите Certbot для получения сертификата. Следуйте инструкциям в консоли. Укажите ваше доменное имя.

```bash
certbot --nginx -d ВАШ_ДОМЕН
```

- Certbot автоматически изменит конфигурацию Nginx, добавив HTTPS блок и настройки SSL.

### Стягивание образа с Docker Hub и запуск контейнера на виртуальном сервере

- Стяните образ вашего приложения с Docker Hub: docker pull ВАШ*DOCKERHUB*ЛОГИН/имя_репозитория
  Например:

```bash
docker pull myusername/myrepo:1.0
```

- Запустите Docker контейнер с вашим бэкенд-приложением и переменными окружения из env-файла сервера. Убедитесь, что приложение слушает на порту, который вы указали в Dockerfile (например, 3000), и что этот порт проброшен на хост-машину, так как Nginx будет обращаться именно к этому порту на хост-машине. Переменная DB_URL_PROD - для подключения к УДАЛЕННОЙ БД. Если вы создали БД из терминала ЛОКАЛЬНОЙ МАШИНЫ, то DB_URL_PROD можно удалить
  Пример команды запуска контейнера с переменными окружения подключения к удаленной БД:

```bash
docker run -d \
  -p 3000:3000 \
  -e DB_URL_PROD="[значение из файла .env сервера]" \
  -e PORT=3000 \
  -e SECRET_ACCESS_TOKEN="[SECRET_ACCESS_TOKEN]" \
  -e SECRET_REFRESH_TOKEN="[SECRET_REFRESH_TOKEN]" \
  -e CLIENT_URL="http://localhost:5173" \
  -e API_KEY="8iuregjr3rgjr" \
  --name tasks \
  myusername/myrepo:1.0
```

*tasks - название контейнера
*API_KEY - переменная окружения для API ключа (если есть)
\*myusername/myrepo:1.0 - стянутый докер-образ вашего проекта

### Финальная проверка

- Откройте в браузере ваше доменное имя (например, `https://ВАШ_ДОМЕН`). Вы должны увидеть ваше React-приложение, работающее по защищенному протоколу HTTPS, а API запросы должны направляться через Nginx на ваш Docker контейнер.

# ДОПОЛНИТЕЛЬНО

### Вариант с покупкой доменного имени на Timeweb (https://www.timeweb.ru/).

Зарегистрируйтесь на Timeweb (https://www.timeweb.ru/)
Выберите подходящее имя и завершите процесс покупки.

1. После покупки домена перейдите в раздел управления доменами.
2. Найдите настройки DNS (управление зонами DNS или аналогичный раздел).
3. Создайте или измените A-запись для вашего домена (например, yourdomain.ru), указав IP-адрес вашего сервера Selectel. Убедитесь, что TTL (время жизни записи) установлено на минимальное значение (например, 600 секунд) для более быстрого обновления.
   **Важно**: Распространение DNS-записей по всему миру может занять от нескольких минут до нескольких часов.

## Дополнительные команды

```bash
docker images # показать список образов
docker image rm ID_ОБРАЗА # удалить образ по id
docker rm ID_КОНТЕЙНЕРА # удалить контейнер по id
docker stop ID_КОНТЕЙНЕРА # остановить контейнер по id
docker ps # показать список запущенных контейнеров
docker ps -a # показать список всех контейнеров
systemctl status nginx # проверить статус Nginx
systemctl enable nginx # включить автозапуск Nginx при старте системы
systemctl start nginx # запустить Nginx
systemctl stop nginx # остановить Nginx
certbot renew --dry-run # проверить автоматическое продление сертификата
```
