# Руководство по установке PostgreSQL через Docker для начинающих

Этот гайд поможет вам установить PostgreSQL с использованием Docker.

## 1. Установка Docker Desktop

Перед началом установите Docker Desktop для вашей ОС:

- **Windows**:  
  [Скачать Docker Desktop для Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- **macOS**:  
  [Скачать Docker Desktop для Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- **Ubuntu/Linux**:  
  [Инструкция по установке Docker Engine](https://docs.docker.com/engine/install/ubuntu/)

  Для Ubuntu достаточно только Docker Engine. Если хочется Docker Desktop: [инструкция по установке Docker Desktop Ubuntu](https://docs.docker.com/desktop/setup/install/linux/ubuntu/)

После установки запустите Docker Desktop и дождитесь статуса "Running" в системном трее.
Проверьте работоспособность Docker Engine с помощью команды:

```
docker -v
```

## 2. Запуск PostgreSQL в контейнере

Выполните в терминале команду, заменив параметры на требуемые:

```bash
docker run -d --name postgres-container -e POSTGRES_PASSWORD=123 -e POSTGRES_USER=admin -e POSTGRES_DB=first_db -e PGDATA=/var/lib/postgresql/data/pgdata -p 5432:5432 -v /home/<USERNAME>/pgdata:/var/lib/postgresql/data --restart unless-stopped postgres
```

### Замена параметров:

1. Замените `<USERNAME>` в пути `-v` на ваше имя пользователя в системе:
   - **Linux/macOS**: `echo $USER` в терминале
   - **Windows**: Используйте путь вида `/c/Users/ваш_пользователь/pgdata`
2. По желанию измените:
   - `POSTGRES_PASSWORD` — пароль администратора
   - `POSTGRES_USER` — имя администратора БД
   - `POSTGRES_DB` — название базы данных

## 3. Основные команды Docker

Запустить существующий контейнер

```bash
docker start postgres-container
```

Остановить контейнер

```bash
docker stop postgres-container
```

Все активные контейнеры

```bash
docker ps
```

Все контейнеры (включая остановленные)

```bash
docker ps -a
```

Удалить контейнер (предварительно остановите его)

```bash
docker rm postgres-container
```

## 4. Работа с PostgreSQL

### Подключение к БД через консоль

```bash
docker exec -it postgres-container psql -U admin -d first_db
```

### Основные SQL-команды

```sql
-- Показать все базы данных
\l

-- Создать таблицу
CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50));

-- Вставить данные
INSERT INTO users (name) VALUES ('John Doe');

-- Выбрать данные
SELECT * FROM users;
```

## 5. Важные примечания

1. После перезагрузки компьютера:
   - Запустите Docker Desktop
   - Выполните `docker start postgres-container`
2. Ваши данные сохраняются благодаря параметру `-v` (volume)  
   Физическое расположение данных: `/home/<USERNAME>/pgdata`

3. Для подключения из приложений используйте:
   - Host: `localhost` или `host.docker.internal`
   - Port: `5432`
   - User/Password: те, что указали в `-e` параметрах

## Проблема с WSL

Если вы вначале установили Postgres на WSL, а потом установили Postgres через Docker, не
удалив предыдущую установку, возникнут проблемы при подключении к базе данных.

Одно из решений: используйте хост `host.docker.internal`

- В Windows (например, в Git Bash) `localhost` указывает на тот порт, куда проброшен
  контейнер (5432).
- В WSL `localhost` может разрешаться как loopback-адрес самой подсистемы, а не
  Windows‑хоста. Таким образом, когда sequelize (или любой клиент) из WSL пытается
  подключиться к `localhost:5432`, он может попасть в другую службу (или даже в остаточные
  данные из прошлой установки), где для пользователя (например, admin) установлен другой
  пароль.
- Вместо того чтобы указывать `localhost` в настройках подключения в WSL, попробуйте
  задать адрес `host.docker.internal`. Этот специальный DNS‑alias позволяет из WSL
  корректно обратиться к сервисам, запущенным в Docker Desktop на Windows.



## Полезные ссылки

- [Официальный образ PostgreSQL на Docker Hub](https://hub.docker.com/_/postgres)
- [Документация Docker](https://docs.docker.com/)
- [Руководство по SQL](https://www.postgresqltutorial.com/)
