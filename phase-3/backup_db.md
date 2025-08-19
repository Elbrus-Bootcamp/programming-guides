### Гайд по настройке автоматического бэкапа базы данных PostgreSQL

Гайд предполагает, что:
- У вас есть сервер (Linux, например Ubuntu) с установленным Docker и Portainer.
- База данных PostgreSQL работает в контейнере с именем `postgres-server`.
- Вы имеете root-доступ или права sudo на хост-машине.
- Скрипт будет запускаться на хосте, а не внутри контейнера.

#### Шаг 1: Предварительные требования
Убедитесь, что на хост-машине установлены необходимые инструменты:
- **Docker и Portainer**: Уже должны быть установлены. Проверьте в Portainer, что контейнер PostgreSQL запущен и доступен.
- **PostgreSQL инструменты**: Установите `pg_dump` на хосте, если его нет: `sudo apt update && sudo apt install postgresql-client` (для Ubuntu/Debian).
- **gzip**: Обычно предустановлен, но проверьте: `sudo apt install gzip`.
- **rclone**: Установите для копирования на Yandex Disk. Скачайте с официального сайта: `curl https://rclone.org/install.sh | sudo bash`.
- **curl**: Для отправки уведомлений в Telegram: `sudo apt install curl`.
- **find**: Для удаления старых бэкапов (предустановлен в Linux).
- Создайте директорию для бэкапов: `mkdir -p /home/admin/backups && chmod 755 /home/admin/backups`.

#### Шаг 2: Настройка rclone для Yandex Disk
rclone использует WebDAV для интеграции с Yandex Disk. Настройте конфигурацию:

1. Запустите настройку: `rclone config`.
2. Выберите `n` (new remote).
3. Назовите remote, например, `yandex-disk`.
4. Выберите тип: `webdav` (введите номер, соответствующий webdav).
5. URL: `https://webdav.yandex.ru`.
6. Vendor: `other`.
7. User: Ваш логин от Yandex (email).
8. Password: Ваш пароль от Yandex (rclone зашифрует его).
9. Подтвердите конфигурацию: `y` (yes).
10. Завершите: `q` (quit).

`Либо можно пойти мануальным способом, следуя инструкции конфигуратора`

Тестируйте: `rclone ls yandex-disk:` — должен показать содержимое вашего диска. Если нужно создать папку `backups`: `rclone mkdir yandex-disk:backups`.

#### Шаг 3: Настройка Telegram-бота для уведомлений
1. Откройте Telegram и найдите @BotFather.
2. Создайте бота: `/newbot`, укажите имя и username (например, `MyBackupBot`).
3. BotFather выдаст `TELEGRAM_BOT_TOKEN` (например, `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).
4. Запустите бота: Отправьте ему сообщение `/start`.
5. Получите `TELEGRAM_CHAT_ID`: Отправьте любое сообщение боту, затем запросите `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` в браузере. В ответе найдите `"chat":{"id":YOUR_CHAT_ID}`.

Сохраните эти значения — они понадобятся в .env файле.

#### Шаг 4: Создание .env файла для переменных
Создайте файл `/home/admin/backups/.env` с содержимым:
```
DB_USER=your_db_username  # Имя пользователя PostgreSQL
DB_NAME=your_db_name      # Имя базы данных
DB_PASS=your_db_password  # Пароль от PostgreSQL
TELEGRAM_BOT_TOKEN=your_bot_token  # Токен от BotFather
TELEGRAM_CHAT_ID=your_chat_id      # ID чата
```
Защитите файл: `chmod 600 /home/admin/backups/.env`.

#### Шаг 5: Создание и корректировка скрипта бэкапа
Создайте файл `/home/admin/backups/backup.sh`:
```bash
#!/bin/bash

# Перенаправление вывода в лог-файл
exec >> /home/admin/backups/backup.log 2>&1

# Загрузка переменных из .env
source /home/admin/backups/.env

# Переменные
BACKUP_DIR="/home/admin/backups"
BACKUP_FILENAME="backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# Проверка наличия переменных
if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ] || [ -z "$DB_PASS" ]; then
    MESSAGE="Error: DB_USER, DB_NAME, or DB_PASS not set in .env"
    curl -s -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
         -d chat_id=$TELEGRAM_CHAT_ID \
         -d text="$MESSAGE"
    exit 1
fi

# Установка пароля для pg_dump
export PGPASSWORD="$DB_PASS"

# Выполнение pg_dump и сжатие
docker exec postgres-server pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$BACKUP_FILENAME

# Проверка успешности бэкапа
if [ $? -eq 0 ]; then
    # Проверка, что файл не пустой
    if [ -s "$BACKUP_DIR/$BACKUP_FILENAME" ]; then
        echo "Бэкап успешно создан: $BACKUP_FILENAME"
        # Отправка бэкапа на Яндекс.Диск
        rclone copy $BACKUP_DIR/$BACKUP_FILENAME yandex-disk:backups/
        if [ $? -eq 0 ]; then
            MESSAGE="Бэкап создан и отправлен на Yandex.Disk: $BACKUP_FILENAME"
        else
            MESSAGE="Бэкап создан, но произошла ошибка отправки на Yandex.Disk: $BACKUP_FILENAME"
        fi
    else
        MESSAGE="Ошибка: Бэкап пустой: $BACKUP_FILENAME"
    fi
else
    MESSAGE="Ошибка создания бэкапа: pg_dump failed"
fi

# Сброс пароля
unset PGPASSWORD

# Отправка уведомления в Telegram
curl -s -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
     -d chat_id=$TELEGRAM_CHAT_ID \
     -d text="$MESSAGE"

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
```

Сделайте скрипт исполняемым: `chmod +x /home/admin/backups/backup.sh`.

#### Шаг 6: Настройка автоматического запуска в 2 часа ночи с помощью cron
1. Откройте crontab: `crontab -e` (для пользователя admin; если root, используйте `sudo crontab -e`).
2. Добавьте строку: `0 2 * * * /home/admin/backups/backup.sh` (это запустит скрипт в 00:00 по UTC; скорректируйте для вашего часового пояса, если нужно. Для 2:00 используйте `0 2`).
3. Сохраните и выйдите. Проверьте: `crontab -l`.

Если сервер в другом часовом поясе, проверьте `timedatectl` и настройте cron соответственно (например, для Москвы: `0 23 * * *` для 2:00 MSK, если сервер в UTC).

#### Шаг 7: Тестирование
1. Запустите скрипт вручную: `/home/admin/backups/backup.sh`.
2. Проверьте:
   - Файл бэкапа в `/home/admin/backups`.
   - Копия на Yandex Disk (через rclone ls или веб-интерфейс).
   - Уведомление в Telegram.
   - Лог: `cat /home/admin/backups/backup.log`.
3. Симулируйте ошибку (например, неверный пароль в .env) и проверьте уведомление.
4. Подождите 7+ дней или вручную удалите старые файлы для теста find.

#### Шаг 8: Возможные проблемы и отладка
- **Docker exec не работает**: Убедитесь, что контейнер `postgres-server` запущен (`docker ps`). Если Portainer управляет стеком, проверьте имя контейнера в Portainer.
- **rclone ошибки**: Проверьте конфиг (`rclone config show`) и логи (`rclone copy --log-level DEBUG`).
- **Telegram не отправляет**: Проверьте token и chat_id через `curl` вручную.
- **pg_dump ошибки**: Убедитесь, что порт PostgreSQL (5432) доступен; если контейнер в сети, используйте `docker exec -it postgres-server pg_dump ...`.
- **Хранение**: Бэкапы хранятся 7 дней локально; настройте find для большего/меньшего срока.
- **Безопасность**: Не храните .env в git; используйте шифрование для продакшена.
