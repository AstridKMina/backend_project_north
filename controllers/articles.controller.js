const response = require("express");
const db = require("../db/connection");
const { fetchArticleById, fetchAllArticles, updateArticleById } = require("../models/articles.model");


exports.getAllArticles = async (req, res, next) => {
  try {

    const { sort_by = "created_at", order = "DESC", topic } = req.query;

    if(topic && typeof topic !== "string") {
      throw { status: 400 , msg: "Invalid topic"}
      
    }

    let articles;

    if(topic) {

     articles = await fetchAllArticles(sort_by, order, topic)

    } else {

      articles = await fetchAllArticles(sort_by, order)

    };

    if(articles.length === 0) {
      throw {status: 404 , msg:"Articles not found" }
    }
    
    return res.status(200).send(articles);

  } catch (err) {
    if (err.status && err.msg) {
      return res.status(err.status).send({ msg: err.msg });
    }
    next(err)
  }
}

exports.getArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    if (isNaN(article_id) || !article_id) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    const articleById = await fetchArticleById(article_id)

    if (!articleById || articleById.length === 0) {
      return res.status(404).send({ msg: "Article not found" });
    }

    res.status(200).send([articleById])

  } catch (err) {
    next(err)
  }
}

exports.patchArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    const { inc_votes } = req.body;

    if (isNaN(article_id) || !article_id) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }

    if(!inc_votes) {
      return res.status(400).send({ msg: "Missing required fields" });
    }

    if(typeof inc_votes !== "number") {
      return res.status(400).send({ msg: "Invalid request body" });
    }
    
    const updatedArticle = await updateArticleById(article_id, inc_votes)

    res.status(200).send(updatedArticle);

  } catch (err) {
    next(err)
  }
}

