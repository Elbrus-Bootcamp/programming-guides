# Загрузка одного файла

## Backend (express)

Документация по multer - https://www.npmjs.com/package/multer


Установка

```bash
npm install multer
```

Далее настраиваем конфигурацию multer (см. документацию)

```js
/**
 * Настройка multer
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // здесь cb - колбек, который возвращает значение для св-ва destination
    cb(null, "public/uploads/"); // папка куда сохранять файлы
  },
  filename: function (req, file, cb) { //здесь cb - колбек, который возвращает значение для св-ва filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // уникальное имя файла
    cb(null, uniqueSuffix + path.extname(file.originalname)); // file.originalname - расширение файла
  },
});
```

Создаем функцию `upload` с нашей конфигурацией

```js
const upload = multer({ storage });
```

Пишем наш endpoint

```js
app.post(
  "/upload", // название endpoint
  upload.single("name_of_file_input"), // запуск нашего multer, именно здесь файл загружается в папку
  function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log("File:", req.file.path); // Путь, который вернул multer (СОХРАНЯЕМ ЕГО В БД)

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.status(200).send(`File uploaded: ${req.file.filename}`);
  }
);
```

## Frontend (React)

Делаем состояние для хранения файла.

```jsx
const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);  // нужен для очистки отображаемого имени файла после загрузки

```

И форму с обработчиками событий.

Обратите внимание, что event.target **всегда** возвращает массив.

```jsx
 <>
      <header onSubmit={handleSubmit} className="App-header">
        <form encType="multipart/form-data">
          <input
            type="file"
            name="name_of_file_input"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef} // нужно для очистки отображаемого имени файла после загрузки
          />
          <button type="submit">Submit</button>
        </form>
      </header>
    </>
```
Обработчик на отправку формы  `handleSubmit`

`  "Content-Type": "multipart/form-data", ` - обязательно.

Все поля для отправки (в том числе остальные поля с текстом) крепим так же к `formData` : `  formData.append("name", name);`
```jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name_of_file_input", file); //  добавляем файл в formData

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData, // передаем formData
        {
          headers: {
            "Content-Type": "multipart/form-data", // указываем тип контента
          },
        }
      );
      console.log("File uploaded successfully:", response.data);
      setFile(null);
      setName("");
      fileInputRef.current.value = '';
      
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
```
