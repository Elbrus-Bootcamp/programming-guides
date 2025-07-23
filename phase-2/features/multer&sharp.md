# Руководство по использованию Multer и Sharp с React


## Что такое Multer и Sharp?

- **Multer** — это библиотека для Node.js, которая помогает принимать файлы (например, изображения) от пользователей. Она обрабатывает загруженные файлы и позволяет сохранить их в памяти или на диск.
- **Sharp** — это библиотека для обработки изображений. С её помощью можно, например, сжимать изображения, менять их формат (например, из PNG в WebP) или изменять размер.

Вместе эти библиотеки позволяют загружать изображения с фронтенда (React) на сервер (Node.js) и обрабатывать их перед сохранением.

---

## Как это работает?

1. На фронтенде (React):
   - Пользователь выбирает изображение через `<input type="file">`.
   - React отправляет это изображение на сервер с помощью запроса.
2. На бэкенде (Node.js):
   - **Multer** принимает изображение и проверяет, что это действительно изображение (например, JPEG или PNG).
   - **Sharp** обрабатывает изображение (например, конвертирует в формат WebP и сжимает).
   - Сервер сохраняет обработанное изображение в папку.

---

## Шаг 1: Настройка фронтенда (React)

На фронтенде мы создаём форму, которая позволяет пользователю выбрать изображение и отправить его на сервер. Вот ваш код для React:

```tsx
import type { JSX } from 'react';
import { useState } from 'react';
import './App.css';
import axiosInstance from './api';

function App(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const formData = new FormData();
    if (selectedFile) {
      formData.append('image', selectedFile); // Добавляем файл в объект FormData
    }

    try {
      await axiosInstance.post('/upload', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data', // Указываем, что отправляем файл
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h1>Загрузка файла на сервер</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png" // Ограничиваем типы файлов
          onChange={handleFileChange}
          className="file-input"
        />
        {previewUrl && (
          <div className="preview-container">
            <h2>Предпросмотр</h2>
            <img src={previewUrl} alt="Предпросмотр" className="preview-image" />
          </div>
        )}
        <button type="submit" className="submit-button">
          Загрузить
        </button>
      </form>
    </>
  );
}

export default App;
```

### Что здесь происходит?

1. **Выбор файла**: Пользователь выбирает файл через `<input type="file">`. Мы используем `useState`, чтобы сохранить выбранный файл (`selectedFile`) и URL для предпросмотра (`previewUrl`).
2. **Предпросмотр**: Когда пользователь выбирает файл, мы создаём временный URL с помощью `URL.createObjectURL(file)` и показываем изображение на странице.
3. **Отправка файла**: При отправке формы создаётся объект `FormData`, в который добавляется выбранное изображение. Затем файл отправляется на сервер с помощью `axiosInstance.post`.

---

## Шаг 2: Настройка Multer (Node.js)

Multer нужно настроить, чтобы он принимал только нужные файлы (например, изображения) и хранил их в памяти для дальнейшей обработки. Вот ваш код настройки Multer:

```javascript
const multer = require('multer');
const path = require('path');

// Конфигурация Multer для обработки загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(), // Храним файлы в памяти для последующей обработки Sharp
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Допустимые форматы файлов
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true); // Разрешаем загрузку, если формат верный
    }
    cb('Ошибка: разрешены только изображения (jpeg, jpg, png)!'); // Ошибка при неверном формате
  },
});

module.exports = upload;
```

### Что здесь происходит?

1. **Хранение в памяти**: `multer.memoryStorage()` говорит Multer сохранять файл в оперативной памяти, а не на диске. Это удобно, потому что мы передаём файл в `Sharp` для обработки.
2. **Фильтрация файлов**: `fileFilter` проверяет, что загружаемый файл — это изображение (JPEG, JPG или PNG). Если это не так, пользователь увидит ошибку.

---

## Шаг 3: Настройка бэкенда (Node.js)

На бэкенде мы используем **Multer** для получения файла и **Sharp** для его обработки. Вот ваш серверный код:

```javascript
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const sharp = require('sharp'); // Подключаем Sharp для обработки изображений
const upload = require('./middlewares/upload'); // Подключаем настроенный Multer

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Папка для сохранения изображений
const uploadDir = path.join(__dirname, '../Uploads');

app.use('/api/uploads', express.static(path.join(__dirname, '../Uploads')));

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    // Уникальное имя файла
    const fileName = `${Date.now()}.webp`;
    const filePath = path.join(uploadDir, 'images', fileName);

    // Конвертация и сохранение изображения в WebP с помощью Sharp
    await sharp(req.file.buffer)
      .webp({ quality: 80 }) // Указываем формат WebP и качество 80%
      .toFile(filePath);
    res.status(200).json({ message: `Изображение успешно сохранено: ${fileName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обработке изображения' });
  }
});

module.exports = app;
```

### Что здесь происходит?

1. **Multer**: Middleware `upload.single('image')` обрабатывает загруженный файл. Поле `image` должно совпадать с именем, которое вы указали в `formData.append('image', selectedFile)` на фронтенде.
2. **Sharp**: Мы берём файл из `req.file.buffer` (Multer сохраняет его в памяти) и с помощью `sharp` конвертируем в формат WebP с качеством 80%. Затем сохраняем файл на сервере в папку `Uploads/images`.

---

## Как всё связать?

1. **Фронтенд** отправляет файл на маршрут `/api/upload` с помощью `FormData`.
2. **Multer** на сервере проверяет, что это изображение, и сохраняет его в памяти.
3. **Sharp** берёт файл из памяти, конвертирует в WebP, сжимает и сохраняет на диск.
4. Сервер отвечает, что всё прошло успешно (или с ошибкой, если что-то пошло не так).

---

## Полезные советы

- **Проверка ошибок**: Всегда проверяйте, выбран ли файл перед отправкой (`if (selectedFile)`), чтобы избежать ошибок.
- **Качество WebP**: В `sharp().webp({ quality: 80 })` можно менять значение `quality` (от 0 до 100). Меньше качество — меньше размер файла, но хуже изображение.
- **Безопасность**: Multer фильтрует файлы, но стоит также проверять размер файла (например, `limits: { fileSize: 5 * 1024 * 1024 }` для 5 МБ).
- **Папка для файлов**: Убедитесь, что папка `Uploads/images` существует на сервере, иначе Sharp не сможет сохранить файл.

---

## Что ещё?

1. **Дополнительные функции Sharp**: Например, можно изменить размер изображения с помощью `.resize({ width: 300 })`.
