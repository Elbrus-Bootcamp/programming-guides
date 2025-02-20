# Загрузка одного файла

## Frontend (React)

1. Добавить в форму `input` с `type="file"`, прописать атрибут `name`

```jsx
<form onSubmit={handleSubmit}>
  <input
    type="file"
    name="name_of_file_input" // выберите свой атрибут name
  />
  <button type="submit">Отправить</button>
</form>
```

2. Подключить обработчик отправки формы `handleSubmit`

```jsx
const handleSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const response = await axios.post('/api/file-upload', formData);
  console.log('Файл загружен успешно:', response.data);
  form.reset();
};
```

## Backend (express)

Документация по multer - https://www.npmjs.com/package/multer

1. Установка

```bash
npm install multer
```

2. Настройка конфигурации multer (см. документацию)

```js
/**
 * Настройка multer
 */
const path = require('path');

// Укажите путь до папки куда сохранять файлы
const uploadPath = path.resolve(__dirname, '..', 'public', 'images'); // замените на корректный путь

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // здесь cb - колбек, который возвращает значение для св-ва destination
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    //здесь cb - колбек, который возвращает значение для св-ва filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // уникальное имя файла
    cb(null, uniqueSuffix + path.extname(file.originalname)); // file.originalname - расширение файла
  },
});

const upload = multer({ storage });
```

3. Подключение мидлвары `upload` на эндпоинт

```js
app.post(
  '/file-upload',
  upload.single('name_of_file_input'), // указываем name инпута
  function (req, res, next) {
    // req.file содержит объект файла по ключу `name_of_file_input`
    // req.body содержит оставшиеся текстовые поля, если таковые имелись

    // В базу данных сохраняем:
    // либо req.file.filename - имя файла
    // либо req.file.path - путь, который вернул multer

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    res.status(200).send(`File uploaded: ${req.file.filename}`);
  },
);
```

4. Не забывайте удалять файлы с помощью модуля `fs`, если удаляется ресурс из базы данных
