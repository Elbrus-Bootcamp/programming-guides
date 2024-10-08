const express = require("express");
const app = express();

const checkEmptyFields = require("./middleware/checkEmptyFields");
app.use(express.json());

app.post(
  "/submit",
  checkEmptyFields(["name", "email", "password"]),
  (req, res) => {
    res.status(200).json({ message: "Fields are valid!" });
  }
);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
