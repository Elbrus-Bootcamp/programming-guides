# Гайд по работе с библиотекой fs в Node.js

Библиотека `fs` (File System) в Node.js предоставляет API для взаимодействия с файловой системой, моделируя стандартные POSIX-функции. Она позволяет читать, писать, создавать и удалять файлы и директории. Поддерживает синхронные, асинхронные (с колбэками) и промис-основанные API. Рекомендуется использовать промисы для современного кода. 

Подключение библиотеки:

```js
import fs from 'node:fs/promises'; // Для ES

// или

const fs = require('node:fs/promises'); // Для CommonJS
```

**Полная документация располагается по адресу - [FS Node.js Documentation](https://nodejs.org/api/fs.html).**

## Содержание

- [readFile](#readfile) - чтение файла
- [writeFile](#writefile) - запись в файл
- [appendFile](#appendfile) - дозапись в файл
- [existsSync](#existssync) - проверка существования
- [mkdir](#mkdir) - создание директории
- [rmdir](#rmdir) - удаление директории
- [rm](#rm) - удаление файла/директории
- [readdir](#readdir) - чтение директории
- [unlink](#unlink) - удаление файла
- [stat](#stat) - информация о файле
- [rename](#rename) - переименование/перемещение
- [copyFile](#copyfile) - копирование файла
- [open](#open) - открытие файла
- [watch](#watch) - наблюдение за изменениями
- [chmod](#chmod) - изменение прав доступа
- [access](#access) - проверка доступа
- [createReadStream](#createreadstream) - поток чтения
- [createWriteStream](#createwritestream) - поток записи
- [lstat](#lstat) - stat для симлинков
- [symlink](#symlink) - создание симлинка

  `Это не все методы, которые есть в библиотеке. О всех возможностях библиотеки можно почитать в оф. документации.`

## readFile

Читает весь файл и возвращает его содержимое как строку или буфер. Полезно для загрузки конфигов или текстов.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь к файлу.
- `options` (string | Object, optional): Кодировка (например, 'utf8') или объект с опциями.

Пример:
```javascript
import fs from 'node:fs/promises';

async function readMyFile() {
  try {
    const content = await fs.readFile('example.txt', 'utf8');
    console.log(content);
  } catch (err) {
    console.error('Ошибка чтения:', err);
  }
}

readMyFile();
```

## writeFile

Записывает данные в файл, создавая его, если не существует. Перезаписывает существующий файл.

**Принимаемые параметры:**
- `path` (string | Buffer | URL | FileHandle): Путь к файлу.
- `data` (string | Buffer | AsyncIterable | Iterable): Данные для записи.
- `options` (string | Object, optional): Кодировка или объект с опциями.

Пример:
```javascript
import fs from 'node:fs/promises';

async function writeToFile() {
  try {
    await fs.writeFile('newfile.txt', 'Привет, мир!');
    console.log('Файл записан');
  } catch (err) {
    console.error('Ошибка записи:', err);
  }
}

writeToFile();
```

## appendFile

Добавляет данные в конец файла, не перезаписывая.

**Принимаемые параметры:**
- `path` (string | Buffer | URL | FileHandle): Путь к файлу.
- `data` (string | Buffer): Данные для добавления.
- `options` (string | Object, optional): Кодировка или объект с опциями.

Пример:
```javascript
import fs from 'node:fs/promises';

async function appendToFile() {
  try {
    await fs.appendFile('log.txt', '\nНовая строка');
    console.log('Данные добавлены');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

appendToFile();
```

## existsSync

Проверяет, существует ли путь. Возвращает true/false. Только синхронный.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь для проверки.

Пример:
```javascript
import { existsSync } from 'node:fs';

if (existsSync('example.txt')) {
  console.log('Файл существует');
} else {
  console.log('Файл не найден');
}
```

## mkdir

Создаёт новую папку. С опцией `{ recursive: true }` создаёт вложенные папки.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь к директории.
- `options` (integer | Object, optional): Режим или объект с recursive.

Пример:
```javascript
import fs from 'node:fs/promises';

async function createDir() {
  try {
    await fs.mkdir('newfolder/subfolder', { recursive: true });
    console.log('Директория создана');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

createDir();
```

## rmdir

Удаляет пустую папку. С `{ recursive: true }` удаляет с содержимым (устарело, лучше rm).

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь к директории.
- `options` (Object, optional): С recursive, maxRetries и т.д.

Пример:
```javascript
import fs from 'node:fs/promises';

async function removeDir() {
  try {
    await fs.rmdir('oldfolder', { recursive: true });
    console.log('Директория удалена');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

removeDir();
```

## rm

Удаляет файл или папку (с содержимым при `{ recursive: true }`).

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `options` (Object, optional): С force, recursive и т.д.

Пример:
```javascript
import fs from 'node:fs/promises';

async function removeItem() {
  try {
    await fs.rm('oldfile.txt', { recursive: true, force: true });
    console.log('Удалено');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

removeItem();
```

## readdir

Возвращает массив имён файлов/папок в директории.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь к директории.
- `options` (string | Object, optional): Кодировка, withFileTypes, recursive.

Пример:
```javascript
import fs from 'node:fs/promises';

async function listFiles() {
  try {
    const files = await fs.readdir('.');
    console.log('Файлы:', files);
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

listFiles();
```

## unlink

Удаляет файл (не папку).

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь к файлу.

Пример:
```javascript
import fs from 'node:fs/promises';

async function deleteFile() {
  try {
    await fs.unlink('temp.txt');
    console.log('Файл удалён');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

deleteFile();
```

## stat

Возвращает объект Stats с размером, датами и т.д.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `options` (Object, optional): С bigint.

Пример:
```javascript
import fs from 'node:fs/promises';

async function getFileInfo() {
  try {
    const stats = await fs.stat('example.txt');
    console.log('Размер:', stats.size, 'байт');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

getFileInfo();
```

## rename

Переименовывает или перемещает файл/папку.

**Принимаемые параметры:**
- `oldPath` (string | Buffer | URL): Старый путь.
- `newPath` (string | Buffer | URL): Новый путь.

Пример:
```javascript
import fs from 'node:fs/promises';

async function renameFile() {
  try {
    await fs.rename('old.txt', 'new.txt');
    console.log('Переименовано');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

renameFile();
```

## copyFile

Копирует файл из одного места в другое.

**Принимаемые параметры:**
- `src` (string | Buffer | URL): Источник.
- `dest` (string | Buffer | URL): Назначение.
- `mode` (integer, optional): Флаги копирования.

Пример:
```javascript
import fs from 'node:fs/promises';

async function copyFile() {
  try {
    await fs.copyFile('source.txt', 'copy.txt');
    console.log('Скопировано');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

copyFile();
```

## open

Открывает файл и возвращает FileHandle для операций.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `flags` (string, optional): Флаги (например, 'r').
- `mode` (integer, optional): Режим.

Пример:
```javascript
import fs from 'node:fs/promises';

async function openAndRead() {
  let filehandle;
  try {
    filehandle = await fs.open('example.txt', 'r');
    const content = await filehandle.readFile({ encoding: 'utf8' });
    console.log(content);
  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await filehandle?.close();
  }
}

openAndRead();
```

## watch

Следит за изменениями в файле/папке.

**Принимаемые параметры:**
- `filename` (string | Buffer | URL): Путь.
- `options` (string | Object, optional): persistent, recursive, encoding.

Пример:
```javascript
import { watch } from 'node:fs';

watch('example.txt', (eventType, filename) => {
  console.log(`Событие: ${eventType}, файл: ${filename}`);
});
```

## chmod

Изменяет разрешения файла (например, сделать исполняемым).

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `mode` (integer): Режим (octal, как 0o755).

Пример:
```javascript
import fs from 'node:fs/promises';

async function changePermissions() {
  try {
    await fs.chmod('script.sh', 0o755);
    console.log('Права изменены');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

changePermissions();
```

## access

Проверяет разрешения пользователя на файл/директорию.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `mode` (integer, optional): Флаги (например, fs.constants.F_OK).

Пример:
```javascript
import fs from 'node:fs/promises';
import { constants } from 'node:fs';

async function checkAccess() {
  try {
    await fs.access('example.txt', constants.R_OK);
    console.log('Можно читать');
  } catch (err) {
    console.error('Нет доступа:', err);
  }
}

checkAccess();
```

## createReadStream

Создаёт поток для чтения больших файлов по частям.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `options` (string | Object, optional): Кодировка, start, end и т.д.

Пример:
```javascript
import { createReadStream } from 'node:fs';

const stream = createReadStream('large.txt', 'utf8');
stream.on('data', (chunk) => {
  console.log(chunk);
});
stream.on('end', () => {
  console.log('Чтение завершено');
});
```

## createWriteStream

Создаёт поток для записи больших файлов по частям.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `options` (string | Object, optional): Кодировка, flags и т.д.

Пример:
```javascript
import { createWriteStream } from 'node:fs';

const stream = createWriteStream('output.txt');
stream.write('Данные для записи\n');
stream.end('Конец');
stream.on('finish', () => {
  console.log('Запись завершена');
});
```

## lstat

Возвращает Stats для симлинка, не разыменовывая его.

**Принимаемые параметры:**
- `path` (string | Buffer | URL): Путь.
- `options` (Object, optional): С bigint.

Пример:
```javascript
import fs from 'node:fs/promises';

async function getLinkInfo() {
  try {
    const stats = await fs.lstat('symlink.txt');
    console.log('Это симлинк?', stats.isSymbolicLink());
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

getLinkInfo();
```

## symlink

Создаёт симлинк на цель.

**Принимаемые параметры:**
- `target` (string | Buffer | URL): Цель.
- `path` (string | Buffer | URL): Путь симлинка.
- `type` (string, optional): 'file', 'dir' или 'junction' (для Windows).

Пример:
```javascript
import fs from 'node:fs/promises';

async function createSymlink() {
  try {
    await fs.symlink('target.txt', 'link.txt');
    console.log('Симлинк создан');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

createSymlink();
```
