# Деплой на Selectel с использованием Portainer (для управления контейнерами), Vite (frontend) и Express (backend)

## Сборка приложения

### Подготовка приложения

1. Перемести весь код проекта в папку `client` или переименуй корневую папку в `client`
2. На одном уровне с `client` создай папку `server`.
3. В папке `server` проинициализируй простой сервер. Например:
   1. `npm init -y`
   2. `npx gitignore node`
   3. `npx eslint --init`
   4. `npm i express morgan`
4. Создай файл `server.js` и опиши простейший API сервер. Например:

```js
const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.listen(3000, () => console.log('Server started'));
```

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
6. В API сервере в файле `server.js` подключить модуль `path` и в конец эндпоинтов и до
   строчки `app.listen` добавить строки:

```js
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});
```

### Контейнеризация сервера (Docker)

1. Прописать отлов ошибок `try/catch` на каждом эндпоинте сервера, обработать все ошибки.
2. Добавить в `.gitignore` на сервере всего, чего не хватает в списке:

```
node_modules/
distr/
.env
```

1. Прописать скрипты запуска в package.json:

```json
{
  "start": "NODE_ENV=production node src/server.js"
}
```

4. Создать файл `.dockerignore` и прописать туда `node_modules`
5. В корневой папке сервера создать `Dockerfile` и описать образ. Например, так:

```dockerfile
FROM node:20-alpine3.17
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
CMD ["npm", "start"]
```

6. В корне сервера выполнить `docker build . -t [имя образа]:[версия]` и затем проверить
   наличие созданного образа через `docker images`
   1. например, на api сервере `docker build . -t myproject:1.0`
   2. если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
      например `docker build . -t myproject:1.0 --platform linux/amd64`
7. Перейти на https://hub.docker.com/ (создать учётную запись, если нет)
8. https://hub.docker.com/settings/security создать `Access Token`
9. В терминале выполнить `docker login --username=[имя пользователя]`
10. Вместо пароля ввести `Access Token`
11. Создать репозиторий на Docker Hub
12. Добавить tag к образу:
    `docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]`
    1. например, на api сервере `docker tag myproject:1.0 myusername/myrepo:1.0`
13. Отправить образ в Docker Hub:
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

## Domain

8. После создания сервера копируем публичный IP, переходим на https://freedns.afraid.org/
   и регистрируемся там для получения доменого имени 3го уровня
   1. Во время регистрации поле userID это никнейм
   2. После регистрации подтверждаем почту
9. Переходим в раздел `Subdomains` и создаём новый субдомен
10. Выбираем `type A`
11. Прописываем желаемый субдомен
12. Вставляем внешний IP из Selectel
13. Через минут 30 можно будет проверить домен через `ping`

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
    }
}
```

8. В веб-приложении Portainer: перейти в Home, выбрать подключенный local, создать новый
   stack и заполнить yml файл.
   1. Скопировать пример файла ниже и вставить его в поле в Web-editor
   2. Заполнить своими данными все переменные окружения в разделах `environment`
   3. Заполнить вместо `[пользователь системы]` созданного на сервере пользователя
      (например, `elbrus`)
   4. Вместо `<DOCKERHUBUSER>/<REPO>:<TAG>` вставить ссылку на dockerhub образ проекта

```yml
version: '1.0'

name: deploy-server
services:
  myapp-service:
    container_name: myapp-service
    hostname: myapp
    image: <DOCKERHUBUSER>/<REPO>:<TAG>
    volumes:
      - /home/[пользователь системы]/myapp:/app/assets
    environment:
      - NODE_ENV=production
    ports:
      - 3000:3000
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
```

9. Стартуем стак дожидаемся когда поднимутся контейнеры
10. Преходим в stack, выбираем `web-proxy` Nginx и кликаем по иконке exec Console
11. В открывшемся окне Command выбираем /bin/sh и подключаемся
12. Выполняем `certbot --nginx -d [имя домена].com`
13. Соглашаемся со всем, указываем почту и перезапускаем nginx `nginx -s reload`
