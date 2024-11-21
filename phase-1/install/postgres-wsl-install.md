# Установка PostgreSQL на WSL

В данном гайде описано как установить PostgreSQL на WSL

## Установка

1. Откройте WSL
2. Обновите пакеты

```sh
sudo apt update
```

3. Установите PostgreSQL на WSL с помощью команды

```sh
sudo apt install postgresql
```

## После установки

1. По умолчанию Postgres не включается после перезагрузки компьютера. Чтобы запустить его
   после включения компьютера введите в WSL:

```sh
sudo service postgresql start
```

Либо включите сервис в `systemctl`, чтобы postgres запускался автоматически:

```sh
sudo systemctl enable postgresql
```

2. Проверьте работоспособность команды `psql` в терминале. Если она работает - всё гуд!
   Если нет, то введите следующие команды одна за другой:

```sh
sudo -i -u postgres
psql
```

Когда терминал будет выглядеть, как `postgres=#`, введите следующие команды, заменив
"имяпользователя" на реальное название вашего системного юзера

```sql
CREATE ROLE имяпользователя WITH LOGIN SUPERUSER PASSWORD '123';
CREATE DATABASE имяпользователя OWNER имяпользователя;
CREATE ROLE admin WITH LOGIN SUPERUSER PASSWORD '123';
```

3. Для визуализации базы данных скачайте себе PGAdmin или DBeaver

Ссылки на видео:

- [VK](https://vk.com/video300683913_456239191)

- [YouTube](https://www.youtube.com/watch?v=DykpWswg57E)
