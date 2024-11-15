# Деплой на Selectel с использованием Portainer (для управления контейнерами)

## Контейнеризация бота (Docker)

0. Установить `Docker` на компьютер (Docker Desktop)
1. Прописать отлов ошибок `try/catch` на каждом обработчике бота, обработать все ошибки.
2. Добавить в `.gitignore` всего, чего не хватает в списке:

```
node_modules/
distr/
.env
```

3. Прописать скрипты (подготовка БД и запуск) в package.json:

```json
{
  "db:setup": "NODE_ENV=production npx sequelize db:create && NODE_ENV=production npx sequelize db:migrate && NODE_ENV=production npx sequelize db:seed:all",
  "start": "NODE_ENV=production node index.js"
}
```

4. Прописать подключение к базе данных в режиме `production` и `development`. Лучше
   использовать различные переменные окружения:
   `DB_USER, DB_NAME, DB_PASS, DB_HOST, DB_URL` для `development` и
   `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD, DB_URL_PROD` для `production`.
   Например, так:

```js
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

5. Создать файл `.dockerignore` и прописать туда `node_modules`
6. В корневой папке сервера создать `Dockerfile` и описать образ. Например, так:

```dockerfile
FROM node:20-alpine3.17
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
CMD ["npm", "start"]
```

7. В корне сервера выполнить `docker build . -t [имя образа]:[версия]` и затем проверить
   наличие созданного образа через `docker images`
   1. например `docker build . -t myproject:1.0`
   2. если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
      например `docker build . -t myproject:1.0 --platform linux/amd64`
8. Перейти на https://hub.docker.com/ (создать учётную запись, если нет)
9. https://hub.docker.com/settings/security создать `Access Token`
10. В терминале выполнить `docker login --username=[имя пользователя]`
11. Вместо пароля ввести `Access Token`
12. Создать репозиторий на Docker Hub
13. Добавить tag к образу:
    `docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]`
    1. например `docker tag myproject:1.0 myusername/myrepo:1.0`
14. Отправить образ в Docker Hub:
    `docker push [имя пользователя]/[имя репозитория]:[имя тэга]` и проверить наличие
    образа через `docker images`

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
7. В терминале создать необходимые файлы и папки.

   1. создать папку для pgadmin `mkdir pgadmin_data` и выставить на нее права
      `sudo chown -R 5050:5050 pgadmin_data/`

8. В веб-приложении Portainer: перейти в Home, выбрать подключенный local, создать новый
   stack и заполнить yml файл.
   1. Скопировать пример файла ниже и вставить его в поле в Web-editor
   2. Заполнить своими данными все переменные окружения в разделах `environment`
   3. Заполнить вместо `[пользователь системы]` созданного на сервере пользователя
      (например, `elbrus`)
   4. Вместо `<DOCKERHUBUSER>/<REPO>:<TAG>` вставить ссылку на dockerhub образ проекта
   5. Вместо `mypassword123, myuser123` и т.д. прописать переменные подключения к базе
      данных (их можно задать и через переменные окружения интерфейса Portainer)

```yml
version: '1.0'

name: deploy-server
services:
  postgres-server:
    container_name: postgres-server
    hostname: postgresql
    image: postgres:latest
    volumes:
      - postgres-server-master_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD:-mypassword123}
      - POSTGRES_USER=${DATABASE_USER:-myuser123}
      - POSTGRES_DB=${DATABASE_DEFAULT:-postgres}
    networks:
      - services
    ports:
      - 5432:5432
    restart: always

  bot-service:
    container_name: bot-service
    hostname: bot
    image: <DOCKERHUBUSER>/<REPO>:<TAG>
    volumes:
      - /home/[пользователь системы]/bot:/app/assets
    environment:
      - DB_NAME_PROD=${DB_NAME_PROD:-mydatabase123}
      - DB_PASS_PROD=${DB_PASS_PROD:-mypassword123}
      - DB_USER_PROD=${DB_USER_PROD:-myuser123}
      - DB_HOST_PROD=${DB_HOST_PROD:-postgres-server}
      - TELEGRAM_TOKEN=${TELEGRAM_TOKEN}
      - NODE_ENV=production
    networks:
      - services
    depends_on:
      - postgres-server
    restart: always

  pgadmin:
    container_name: postgres-pgadmin
    hostname: postgres-pgadmin
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=${PGADMIN_DEFAULT_EMAIL:-admin@admin.com}
      - PGADMIN_DEFAULT_PASSWORD=${PGADMIN_DEFAULT_PASSWORD:-mypassword123}
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

9. Стартуем стак дожидаемся когда поднимутся контейнеры
10. На локальном компьютере заполняем переменные окружения для `production` базы данных:
    `DB_USER_PROD, DB_NAME_PROD, DB_PASS_PROD, DB_HOST_PROD` или `DB_URL_PROD`. Указываем
    данные для подключения исходя из переменных, указанных в `docker-compose`. Если не
    заполняли в Portainer, то это дефолтные значения `myuser123, mypassword123` и т.д. В
    хосте указать IP
11. Выполняем `npm run db:setup`
