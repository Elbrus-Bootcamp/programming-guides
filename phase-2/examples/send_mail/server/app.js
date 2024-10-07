const express = require("express");
const nodemailer = require("nodemailer");
const app = express();

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,  
  auth: {
    user: "your_mail@mail.ru", // <--- ваша почта
    pass: "vekU14LmwP5tpGN7H3aK", //Введите пароль для внешнего приложения!!!!
  },
});

// upload.single("name_of_file_input") - имя поля в форме
app.post("/sendmail", async(req, res) => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <dead142@mail.ru>', // sender address
    to: "dead0343@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  res.status(200).send(`mail is send`);
});
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
