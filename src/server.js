const express = require("express");
const server = express();

server.get("/", (req, res) => {
  res.send("Bot is alive!");
});

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

module.exports = keepAlive;
