import express from "express"; //const express = require("express");
import path from "path"; //const path = require("path");
const outDir = path.resolve("./dist/" || process.env.OUT_DIR);
const app = express();
app.use(express.static(`${outDir}`));

export function runCommand(program) {
  let port = program.port ? program.port : 3000;

  app.get("/", function (req, res) {
    res.sendFile("/index.html");
  });

  app.listen(port);
  console.log(
    `\nGitfolio running on port ${port}, Navigate to http://localhost:${port} in your browser\n`
  );
}

//module.exports = {
//  runCommand
//};
