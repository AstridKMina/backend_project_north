const express = require("express");
const db = require("./db/connection")
const { getTopics } = require("./controllers/topics.controller")
const apiInfo = require('../backend_project_north/endpoints.json');

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




app.use((err, req, res, next) => {
    // console.error(err);
    const status = err.status || 400
    const message = err.msg || "Bad Request"
    res.status(status).send({ msg: message })
    // next();
})

module.exports = app; 