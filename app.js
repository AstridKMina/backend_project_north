const express = require("express");
const db = require("./db/connection")
const { getTopics } = require("./controllers/topics.controller")
const apiInfo = require('./endpoints.json');
const { getArticleById, getAllArticles, patchArticle } = require("./controllers/articles.controller");
const { postComments, getArticleCommentsById, deleteComment } = require("./controllers/comments.controller");
const { getUsers } = require("./controllers/users.controller");

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

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getArticleCommentsById);

app.post("/api/articles/:article_id/comments", postComments);

app.patch("/api/articles/:article_id", patchArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);


app.use((err, req, res, next) => {
    // console.error(err);
    if (err.status && err.msg) {
      return res.status(err.status).send({ msg: err.msg });
  }
    const status = err.status || 500
    const message = err.msg || "Internal server error"
    res.status(status).send({ msg: message })
})

module.exports = app; 