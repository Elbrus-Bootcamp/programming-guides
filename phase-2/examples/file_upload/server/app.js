const express = require("express");
const app = express();

const multer = require("multer"); // npm install multer
const cors = require("cors"); // npm install cors
const path = require("path");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Настройка multer
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // папка куда сохранять файлы
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // уникальное имя файла
    cb(null, uniqueSuffix + path.extname(file.originalname)); // file.originalname - расширение файла
  },
});

const upload = multer({ storage }); // путь куда сохранять файлы
app.use(express.static("public"));

// upload.single("name_of_file_input") - имя поля в форме
app.post(
  "/upload",
  upload.single("name_of_file_input"),
  function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    const { name } = req.body; // получаем имя из formData
    console.log("Name:", name);
    console.log("File:", req.file.path); // Путь, который вернул multer (СОХРАНЯЕМ ЕГО В БД)

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.status(200).send(`File uploaded: ${req.file.filename}`);
  }
);
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
