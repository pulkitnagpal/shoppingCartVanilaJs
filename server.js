const express = require("express");

const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
})
const port = 1200;

app.listen(port, () => {
  console.log("App is fuckin listening now")
})