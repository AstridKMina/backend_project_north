const express = require("express");
const db = require("./db/connection")
const { getTopics } = require("./controllers/topics.controller")
const apiInfo = require('../backend_project_north/endpoints.json');
const { getArticleById } = require("./controllers/articles.controller");

const app = express()

app.use(express.json())

app.get("/api", (req, res, next) => {
    try {
      res.status(200).json({endpoints: apiInfo});
      } catch (err) {
      next(err); 
    }
  });
 
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);



app.use((err, req, res, next) => {
    // console.error(err);
    const status = err.status || 500
    const message = err.msg || "Internal server error"
    res.status(status).send({ msg: message })
})

module.exports = app; 