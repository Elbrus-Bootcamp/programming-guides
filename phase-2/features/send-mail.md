# Отправка писем на почту 

Документация - https://nodemailer.com/

Ставим пакет

```bash
npm install nodemailer
```

Создаем конфиг рассылки почты

Важно! Указывается не пароль от почты, а пароль для приложения (у всех его можно получить по-разному).

Пример на mail.ru  -https://account.mail.ru/user/2-step-auth/passwords/

```js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,  
  auth: {
    user: "your_mail@mail.ru", // <--- ваша почта
    pass: "vekU14LmwP5tpGN7H3aK", //Введите пароль для внешнего приложения!!!!
  },
});

```

И пишем метод для отправки почты 

```js
app.post("/sendmail", async(req, res) => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <your_mail@mail.ru>', // Тут тот же адрес, что и в конфиге!!!
    to: "dead0343@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  res.status(200).send(`mail is send`);
});
```
