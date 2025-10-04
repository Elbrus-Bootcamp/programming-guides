# Гайд по работе и использованию Redis

- [ioredis](https://github.com/redis/ioredis)
- [Redis.io](https://redis.io/)
- [Node-Redis](https://www.npmjs.com/package/redis)

## Введение в Redis

Redis (REmote DIctionary Server) — это высокопроизводительная платформа для работы с данными в реальном времени, которая функционирует как быстрый слой памяти для ускорения приложений. Redis часто используется для кэширования, обработки реального времени и AI-приложений. Он доверен ведущими компаниями по всему миру и позиционируется как инструмент для повышения скорости, памяти и точности приложений.

### Назначение Redis
Основное назначение Redis — служить высокопроизводительной in-memory платформой данных, которая ускоряет разработку и развертывание приложений. Redis предназначен для обработки данных в реальном времени, улучшения скорости приложений и предоставления мощных инструментов для кэширования, AI и синхронизации данных. Он позволяет строить масштабируемые и надежные приложения с минимальными усилиями.

### Ключевые особенности
- **Поддержка AI**: Включает векторную базу данных, память для AI-агентов и семантический поиск для создания чат-ботов и AI-приложений.
- **Кэширование**: Эффективное кэширование для повышения производительности приложений.
- **Redis Query Engine**: Поддержка мощных запросов и поиска в реальном времени.
- **Интеграция данных (RDI)**: Мгновенная синхронизация данных из существующих баз с использованием Change Data Capture (CDC).
- **Развертывание**: Может работать в облаке (Redis Cloud), on-premises или в гибридной среде. Открытый исходный код Redis доступен для бесплатной загрузки.
- **Технические возможности**: Активно-активная геораспределение для 99.999% uptime, автоматический failover, поддержка 18 современных структур данных (включая векторные наборы и JSON), кластеризация, гибкое развертывание.
- **Производительность**: Автоматическое разделение данных по узлам, интеграция с CDC для обновлений в реальном времени.

### Общие сценарии использования
- **AI-приложения**: Создание чат-ботов и AI-агентов с инструментами для векторных баз, семантического поиска и памяти агентов.
- **Кэширование**: Улучшение производительности приложений за счет быстрого доступа к данным.
- **Обработка данных в реальном времени**: Поддержка реального времени запросов и поиска.
- **Синхронизация данных**: Интеграция и синхронизация данных из существующих баз в реальном времени.

Для начинающих: Redis интегрируется с различными стеками (AWS, Azure, Google Cloud, Node.js, Java, Python и др.). Вы можете начать работу за минуты, подключившись с помощью библиотек на вашем языке. Документация и сообщество помогают новичкам, а Redis Cloud упрощает управление в облаке.

## Запуск Redis в Docker Desktop для тестирования в разработке

Для локальной разработки и тестирования рекомендуется запустить Redis в контейнере Docker. Docker Desktop позволяет легко управлять контейнерами на Windows, macOS или Linux. Вот пошаговая инструкция:

### Шаг 1: Установка Docker Desktop
- Скачайте и установите Docker Desktop с официального сайта: [docker.com](https://www.docker.com/products/docker-desktop).
- Запустите Docker Desktop и убедитесь, что он работает (иконка в трее должна быть зеленой).

### Шаг 2: Загрузка образа Redis
Откройте терминал (или PowerShell на Windows) и выполните:
```
docker pull redis:alpine
```
Это загрузит легковесный образ Redis на базе Alpine Linux с Docker Hub.

### Шаг 3: Настройка Docker Compose
Для удобного управления Redis в Docker рекомендуется использовать Docker Compose. Создайте файл `docker-compose.yml` с конфигурацией Redis:

```yaml
version: '3.8'

services:
  redis:
    container_name: redis-server
    hostname: redis
    image: redis:alpine
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - services
    ports:
      - 6379:6379
    restart: always

volumes:
  redis-data:

networks:
  services:
    driver: bridge
```

- **Объяснение параметров**:
  - `container_name: redis-server`: Имя контейнера для удобства.
  - `hostname: redis`: Хостнейм для обращения внутри сети.
  - `image: redis:alpine`: Легковесный образ Redis.
  - `environment`: Переменная `REDIS_PASSWORD` задается в `.env` (например, `REDIS_PASSWORD=yourpassword`).
  - `command`: Запускает redis-server с паролем.
  - `volumes: redis-data:/data`: Сохраняет данные Redis в volume для персистентности.
  - `networks`: Сеть `services` для взаимодействия с другими сервисами.
  - `ports: 6379:6379`: Прокидывает порт Redis на хост.
  - `restart: always`: Автоматический перезапуск при сбоях.

Создайте файл `.env` в корне проекта:
```
REDIS_PASSWORD=yourpassword
```

### Шаг 4: Запуск контейнера
В директории с `docker-compose.yml` выполните:
```
docker-compose up -d
```
- Флаг `-d` запускает контейнеры в фоновом режиме.
- Проверьте статус: `docker-compose ps`.
- Логи: `docker-compose logs redis`.

### Шаг 5: Проверка подключения
- Подключитесь к Redis CLI внутри контейнера:
  ```
  docker exec -it redis-server redis-cli
  ```
  В CLI выполните `AUTH yourpassword`, затем `PING` — должен вернуться `PONG`.
- С хоста: Используйте клиент (например, ioredis в Node.js) для подключения к `localhost:6379` с паролем из `.env`.

### Шаг 6: Управление контейнером
- **Остановка**: `docker-compose down` (сохраняет volume) или `docker-compose down -v` (удаляет volume).
- **Перезапуск**: `docker-compose restart redis`.
- **Логи**: `docker-compose logs redis`.
- В Docker Desktop вы можете управлять контейнерами через GUI: просматривать логи, запускать CLI и т.д.

Это удобно для тестирования во время разработки — вы можете запускать приложение локально и подключаться к Redis в контейнере.

## Клиент для Node.js: ioredis

ioredis — это мощный, ориентированный на производительность и полнофункциональный клиент Redis для Node.js. Он поддерживает Redis >= 2.6.12 и полностью совместим с Redis 7.x. Ключевые фичи: поддержка Cluster, Sentinel, Streams, Pipelining, Lua-скриптов, Redis Functions, Pub/Sub (с бинарными сообщениями). Написан на TypeScript с официальными декларациями. Для новых проектов рекомендуется node-redis, но ioredis остается надежным выбором.

### Установка
Установите через npm:
```
npm install ioredis
```
Для TypeScript:
```
npm install --save-dev @types/node
```

### Конфигурация
Создайте отдельный файл конфигурации, например `redis.config.js`:
```javascript
import Redis from 'ioredis';
import { config } from 'dotenv';
config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Для dev используем localhost
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Дополнительные опции: db: 0, username: 'default'
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
```
- Используйте `.env` для переменных: `REDIS_HOST=localhost`, `REDIS_PORT=6379`, `REDIS_PASSWORD=yourpassword`.
- Для TLS: Добавьте `tls: { ca: fs.readFileSync('cert.pem') }` или используйте URL `rediss://`.
- Авто-реконнект: По умолчанию включен; настройте `retryStrategy(times) { return Math.min(times * 50, 2000); }`.

## Примеры использования

### Базовое использование
```javascript
const redis = new Redis(); // По умолчанию localhost:6379

// Установка и получение значения
await redis.set('mykey', 'value'); // Возвращает 'OK'
const value = await redis.get('mykey'); // 'value'

// С expiration
await redis.set('key', 'data', 'EX', 60); // Истекает через 60 секунд

// Список команд: zadd, zrange и т.д.
await redis.zadd('sortedSet', 1, 'one', 2, 'dos');
const elements = await redis.zrange('sortedSet', 0, -1, 'WITHSCORES');
```

### Кэширование в приложении (пример с контроллерами)
Используйте конфиг из выше в контроллере, например в Express.js для CRUD с кэшированием контактов:
```javascript
import ContactService from '../services/contact.service.js';
import logger from '../utils/logger.js';
import redis from '../configs/redis.config.js';

class ContactController {
  static getAllContacts = async (req, res) => {
    try {
      const cacheKey = 'contacts:all';
      logger.info('Запрос на получение всех контактов');

      // Проверка кэша
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info({ cacheKey }, 'Контакты взяты из кэша Redis');
        return res.status(200).json(JSON.parse(cached));
      }

      const contacts = await ContactService.getAllContacts();

      // Сохранение в кэш
      await redis.set(cacheKey, JSON.stringify(contacts), 'EX', 3600); // Кэш на 1 час
      logger.info({ cacheKey }, 'Контакты сохранены в кэш Redis');

      logger.info({ count: contacts.length }, 'Контакты успешно получены');
      return res.status(200).json(contacts);
    } catch (error) {
      logger.error({ error }, 'Ошибка при получении контактов');
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  };

  static deleteContact = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info({ id }, 'Запрос на удаление контакта');

      await ContactService.deleteContact(id);

      // Инвалидация кэша
      const allKeys = await redis.keys('contacts:all');
      if (allKeys.length > 0) {
        await redis.del(allKeys);
        logger.info(
          { deletedKeys: allKeys.length },
          'Кэш контактов очищен после удаления',
        );
      } else {
        logger.info('Кэш контактов не найден для очистки');
      }

      logger.info({ id }, 'Контакт успешно удалён');
      return res.status(200).json({ message: 'Контакт успешно удалён' });
    } catch (error) {
      logger.error({ error }, 'Ошибка при удалении контакта');
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  };

  static editContact = async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      logger.info({ id, data }, 'Запрос на обновление контакта');

      const contact = await ContactService.updateContact(id, data);

      // Инвалидация кэша
      const allKeys = await redis.keys('contacts:all');
      if (allKeys.length > 0) {
        await redis.del(allKeys);
        logger.info(
          { deletedKeys: allKeys.length },
          'Кэш контактов очищен после обновления',
        );
      } else {
        logger.info('Кэш контактов не найден для очистки');
      }

      logger.info({ id }, 'Контакт успешно обновлён');
      return res.status(200).json(contact);
    } catch (error) {
      logger.error({ error }, 'Ошибка при обновлении контакта');
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  };

  static addContact = async (req, res) => {
    try {
      const data = req.body;
      logger.info({ data }, 'Запрос на добавление контакта');

      const contact = await ContactService.addContact(data);

      // Инвалидация кэша
      const allKeys = await redis.keys('contacts:all');
      if (allKeys.length > 0) {
        await redis.del(allKeys);
        logger.info(
          { deletedKeys: allKeys.length },
          'Кэш контактов очищен после добавления',
        );
      } else {
        logger.info('Кэш контактов не найден для очистки');
      }

      logger.info({ contact }, 'Контакт успешно добавлен');
      return res.status(201).json(contact);
    } catch (error) {
      logger.error({ error }, 'Ошибка при добавлении контакта');
      return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  };
}

export default ContactController;
```

### Pub/Sub
Для публикации/подписки используйте отдельные инстансы:
```javascript
const pub = new Redis();
pub.publish('channel', 'message');

const sub = new Redis();
sub.subscribe('channel');
sub.on('message', (channel, message) => console.log(message));
```

### Pipelining для производительности
```javascript
const pipeline = redis.pipeline();
pipeline.set('foo', 'bar').get('foo').exec((err, results) => {
  // results: [[null, 'OK'], [null, 'bar']]
});
```

### Транзакции
```javascript
redis.multi().set('foo', 'bar').get('foo').exec((err, results) => {});
```

### Lua-скрипты
Определите кастомную команду:
```javascript
redis.defineCommand('myecho', { numberOfKeys: 2, lua: 'return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}' });
const result = await redis.myecho('k1', 'k2', 'a1', 'a2'); // ['k1', 'k2', 'a1', 'a2']
```

### Дополнительные советы
- **Префиксы ключей**: `{ keyPrefix: 'app:' }` для неймспейсов.
- **Трансформация**: Настройте аргументы/ответы для удобства (например, HGETALL как объект).
- **Мониторинг**: `const monitor = await redis.monitor(); monitor.on('monitor', console.log);`.
- **Сканирование**: Используйте `scanStream` для итерации ключей.
- **Cluster/Sentinel**: Настройте для масштабируемости (см. документацию).
- **Отладка**: `DEBUG=ioredis:* node app.js`.
- **Ошибки**: Обрабатывайте `ReplyError`; используйте `{ showFriendlyErrorStack: true }` для dev.
