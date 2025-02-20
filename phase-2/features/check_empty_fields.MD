# Middleware для проверки пустых полей 
 
## Middleware

Параметр ` location = 'body'` дает возможность проверять как `req.body` так и `req.params`

```js
// ./middleware/checkEmptyFields.js

const checkEmptyFields = (fields, location = 'body') => (req, res, next) => {  
    const data = req[location];  
    const missingFields = []; // По умолчанию считаем, что нет пустых полей
  
    fields.forEach(field => {
      if (!data[field] || data[field].trim() === '') { // если нет поля или оно пустое
        missingFields.push(field); // Добавляем в массив пустых 
      }
    });
  
    if (missingFields.length > 0) { // Если есть хотя бы одно незаполненное поле отдаем 400 с именами полей
      return res.status(400).json({
        error: 'Missing or empty fields',
        missingFields: missingFields
      });
    }
  
    next();
  };
  
  module.exports = checkEmptyFields;

```

## Пример использования


```js
const checkEmptyFields = require("./middleware/checkEmptyFields");
app.use(express.json());

app.post(
  "/submit",
  checkEmptyFields(["name", "email", "password"]), // Указываем какие поля хотим проверить, по-умолчанию из req.body
  (req, res) => {
    res.status(200).json({ message: "Fields are valid!" });
  }
);
```