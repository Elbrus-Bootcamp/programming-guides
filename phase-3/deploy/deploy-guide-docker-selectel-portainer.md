# Деплой на Selectel с использованием Portainer (для управления контейнерами), Vite (frontend) и Express (backend)

## Сборка приложения

### Билд клиентского приложения (Vite)

1. Обработать и решить все ошибки Typescript
   1. Чтобы TS не ругался на неиспользуемые параметры в функциях (как, например, в
      `reducers`), можно в файле `tsconfig.json` прописать поля `"noUnusedLocals": false`
      и `"noUnusedParameters": false`.
2. В файле `vite.config.ts` в корне клиентского проекта прописать исходящую директорию
   сборки на API сервер:

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

3. В `.env` клиента заменить адрес API сервера на `/` (так как в будущем приложение будет
   раздаваться с API сервера)
4. Выполнить `npm run build` для сборки клиентского приложения (он выполнится в директорию
   `dist` на API сервере)
5. Внести папку `dist` в `.gitignore` на API сервере
6. В API сервере в файле `server.js` подключить модуль `path` и в конец эндпоинтов
   добавить строки:

```js
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});
```

7. Необходио удостовериться, что при запуске сервера мы слушаем только порт, а нет второго параметра (хоста), либо должен стоять хост 0.0.0.0

### Контейнеризация сервера (Docker)

1. Прописать отлов ошибок `try/catch` на каждом эндпоинте сервера, обработать все ошибки.
2. Добавить в `.gitignore` на сервере всего, чего не хватает в списке:

```
node_modules/
dist/
.env
```

3. Прописать скрипты (подготовка БД и запуск) в package.json:

```json
{
  "db:setup": "NODE_ENV=production sequelize db:create && NODE_ENV=production sequelize db:migrate && NODE_ENV=production sequelize db:seed:all",
  "start": "NODE_ENV=production node src/server.js"
}
```

4. Прописать подключение к базе данных в режиме `production` и `development`. Лучше
   использовать различные переменные окружения: `DB_USER, DB_NAME, DB_PASS, DB_HOST` для
   `development` и `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD` для
   `production`. Например, так:

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
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASS_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: 'postgres',
    use_env_variable: process.env.DB_URL_PROD ? 'DB_URL_PROD' : undefined,
  },
};
```

5. Создать файл `.dockerignore` и прописать туда:

```
node_modules/
.env
```

6. В корневой папке сервера создать `Dockerfile` и описать образ. Например, так:

```dockerfile
FROM node:22-alpine3.19
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci --omit=dev
CMD ["npm", "start"]
```

7. В корне сервера выполнить `docker build . -t [имя образа]:[версия]` и затем проверить
   наличие созданного образа через `docker images`
   1. например, на api сервере `docker build . -t myproject:1.0`
   2. если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
      например `docker build . -t myproject:1.0 --platform linux/amd64`
8. Перейти на https://hub.docker.com/ (создать учётную запись, если нет)
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
   1. OS: Ubuntu 22.04 LTS
   2. 1 vCPU, 1 GB RAM
   3. Память: Базовый SSD 8 GB
   4. Сеть: подсеть -> Новый публичный IP-адрес
6. Сохраняем пароль к root пользователю в безопасном месте
7. Создаём SSH-ключ, подробнее:
   https://docs.selectel.ru/cloud/servers/manage/create-and-place-ssh-key/
   1. Создаём новый SSH ключ (например, `ssh-keygen -t ed25519`) или находим существующий
   2. Копируем публичный SSH ключ (например `cat ~/.ssh/id_ed25519.pub`) и вставляем в
      нужное поле в настройках сервера (если не получилось, добавьте в конце перенос
      строки)

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

### Настройка нового пользователя

1. Для настройки VPS можно:
   1. подключиться через SSH
   2. либо воспользоваться внутренним терминалом сервера в веб-интерфейсе Selectel
2. Подключаемся через SSH `ssh root@[внешний ip адрес]`, вводим yes чтобы добавить IP
   сервера в разрешённые и вводим пароль root пользователя (возможно, сработает со 2 раза)
3. Создать пользователя, отличного от root через `adduser [имя пользователя]`. Например:
   `adduser elbrus`, прописываем ему пароль и необходимые другие данные
4. Добавить созданного пользователя в sudoers:
   1. вводим `visudo`
   2. прописываем права в файле `[имя пользователя] ALL=(ALL:ALL) ALL`
   3. Выходим из файла (ctrl+x yes enter)
5. Переключаемся на созданного пользователя `su - [имя пользователя]`, например
   `su - elbrus`

### Настраиваем Docker

1. Устанавливаем Docker

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

2. После установки Docker добавляем группу

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

3. Необходимо перезапустить терминал чтобы изменения вступили в силу

```bash
exit
su - <username>
```

4. Создать volume для Portainer

```bash
docker volume create portainer_data
```

5. Запустить контейнер:

```bash
docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

6. После запуска контейнера необходимо к нему подключиться по ip:9000 (на порту 9000) в
   течении нескольких минут, придумать учетное имя для входа иначе он заблокируется
7. В терминале создать необходимые файлы и папки:

   - создать папку для pgadmin `mkdir pgadmin_data` и выставить на нее права
     `sudo chown -R 5050:5050 pgadmin_data/`
   - создать папку для данных certbot `mkdir letsencrypt`
   - создать папку с конфигом для NGINX: `mkdir nginx` и затем `touch nginx/default.conf`
   - открыть созданный файл `nano nginx/default.conf`, вставить конфиг, прописать
     полученный домен `[имя домена]`, заменить `myapp:3000` (можно заменить позже),
     сохранить (ctrl+x yes enter)
   - адрес `myapp:3000` выбран исходя из yml конфига для docker-compose (расположен ниже)

```
server {
    listen 80;
    server_name [имя домена].com;

    location / {
        proxy_pass http://myapp:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

1. В веб-приложении Portainer: перейти в Home, выбрать подключенный local, создать новый
   stack и заполнить yml файл.
   1. Скопировать пример файла ниже и вставить его в поле в Web-editor
   2. Заполнить своими данными все переменные окружения в разделах `environment`
   3. Заполнить вместо `[пользователь системы]` созданного на сервере пользователя
      (например, `elbrus`)
   4. Вместо `<DOCKERHUBUSER>/<REPO>:<TAG>` вставить ссылку на dockerhub образ проекта
   5. Вместо `mypassword123, myuser123` и т.д. прописать переменные подключения к базе
      данных (их можно задать и через переменные окружения интерфейса Portainer)

```yml
name: deploy-server

services:
  postgres-server:
    container_name: postgres-server
    hostname: postgresql
    image: postgres:latest
    volumes:
      - postgres-server-master_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD
      - POSTGRES_USER
      - POSTGRES_DB
    networks:
      - services
    ports:
      - 5432:5432
    restart: always

  myapp-service:
    container_name: myapp-service
    hostname: myapp
    image: <DOCKERHUBUSER>/<REPO>:<TAG>
    volumes:
      - /home/[пользователь системы]/myapp:/app/assets
    environment:
      - DB_NAME_PROD
      - DB_PASS_PROD
      - DB_USER_PROD
      - DB_HOST_PROD=postgres-server
      - ACCESS_TOKEN_SECRET
      - REFRESH_TOKEN_SECRET
      - NODE_ENV=production
    ports:
      - 3000:3000
    networks:
      - services
    depends_on:
      - postgres-server
    restart: always

  nginx:
    container_name: web_proxy
    hostname: nginx
    image: panferovdev/nginxcertbot:1.0
    volumes:
      - /home/[пользователь системы]/nginx:/etc/nginx/conf.d/
      - /home/[пользователь системы]/letsencrypt:/etc/letsencrypt
    ports:
      - 80:80
      - 443:443
    networks:
      - services

  pgadmin:
    container_name: postgres-pgadmin
    hostname: postgres-pgadmin
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL
      - PGADMIN_DEFAULT_PASSWORD
    networks:
      - services
    volumes:
      - /home/[пользователь системы]/pgadmin_data:/var/lib/pgadmin
    ports:
      - 5050:80
    restart: on-failure
    depends_on:
      - postgres-server

volumes:
  postgres-server-master_data:
    driver: local
    name: postgres-server-master_data
  pgadmin_data:
    driver: local
    name: pgadmin_data

networks:
  services:
    name: ${DATABASE_NETWORK:-postgres-server}
```

9. Внизу после yml выбираем заполнение переменных окружений и `advanced mode`. Вставляем
   все используемые переменные окружения:

```
POSTGRES_PASSWORD="ваш пароль для подключения к базе данных"
POSTGRES_USER="имя вашего пользователя с правами superuser для работы с БД"
POSTGRES_DB="ваша дефолтная база данных (лучше использовать postgres)"
DB_NAME_PROD="ваша база данных для проекта"
DB_PASS_PROD="ваш пароль подключения к базе данных (укажите, как в переменной POSTGRES_PASSWORD)"
DB_USER_PROD="имя пользователя для подключения к базе данных (укажите, как в переменной POSTGRES_USER)"
ACCESS_TOKEN_SECRET="ваш токен доступа"
REFRESH_TOKEN_SECRET="ваш токен обновления"
PGADMIN_DEFAULT_EMAIL="ваш email для подключения к PGAdmin (используйте нормальый email, например elbrus@mail.com)"
PGADMIN_DEFAULT_PASSWORD="ваш пароль для подключения к PGAdmin"
```

10. Стартуем стак дожидаемся когда поднимутся контейнеры
11. Подключаемся к контейнеру `web-proxy` Nginx и выполняем в нём код

- Либо через SSH терминал: найти id docker контейнера через `docker ps`

```sh
docker ps # найти id контейнера Nginx и подставить в [container_id]
docker exec -it [container_id] sh
```

- Либо через Web-интерфейс Portainer: преходим в stack, выбираем `web-proxy` Nginx и
  кликаем по иконке exec Console, в открывшемся окне Command выбираем /bin/sh и
  подключаемся

> На текущий момент в последней версии Docker 5:26.0.0-1 присутствует баг получения
> доступа к консоли. Из-за этого в Portainer терминал может не открываться, или может
> появляться ошибка. Если очень хочется визуально открыть консоль в Portainer вместо
> терминала SSH, нужно откатиться к последней стабильной версии Docker. Для отката к
> последней на данной момент стабильной версии Docker перейдите в документацию
> [по установке конкретной версии](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository):
> выберите Install the Docker packages, и далее вкладку Specific Version.
>
> Введи `apt-cache madison docker-ce | awk '{ print $3 }'` для отображения актуальных
> версий Docker Скопируй требуемую версию. На момент написания комментария рабочая версия
> без бага была 5:25.0.5-1 Скорректируй под свою задачу и выполни установку требуемой
> версии:

```bash
VERSION_STRING=5:24.0.0-1~ubuntu.22.04~jammy
sudo apt-get install docker-ce=$VERSION_STRING docker-ce-cli=$VERSION_STRING containerd.io docker-buildx-plugin docker-compose-plugin
```

12. Выполняем `certbot --nginx -d [имя домена].com`
13. Соглашаемся со всем, указываем почту и перезапускаем nginx `nginx -s reload`
14. На локальном компьютере заполняем переменные окружения для `production` базы данных:
    `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD`. Указываем данные для
    подключения исходя из переменных, указанных в `docker-compose`. В хосте указать IP
15. Выполняем `npm run db:setup`
