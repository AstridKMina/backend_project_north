const response = require("express");
const db = require("../db/connection");
const { fetchArticleById, fetchAllArticles } = require("../models/articles.model");


exports.getAllArticles = async (req, res, next) => {
  try {

    const { sort_by = "created_at", order = "ASC" } = req.query;

    const articles = await fetchAllArticles(sort_by, order)

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

    if (!articleById || articleById === 0) {
      return res.status(404).send({ msg: "Article not found" });
    }

    res.status(200).send([articleById])

  } catch (err) {
    next(err)
  }
}

exports.getArticleCommentsById = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    if (isNaN(article_id || !article_id)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }

    const article = await fetchArticleById(article_id);

    if (!article) {
      return res.status(404).send({ msg: "Article not found" });
    }

    const articleCommentsById = await fetchArticleCommentsById(article_id)

    res.status(200).send(articleCommentsById)


  } catch (err) {
    next(err)
  }
}
