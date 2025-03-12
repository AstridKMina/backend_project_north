const response = require("express");
const db = require("../db/connection");
const { fetchArticleById, fetchAllArticles, fetchArticleCommentsById, insertComments, updateArticleById } = require("../models/articles.model");


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

    if (!articleById || articleById.length === 0) {
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

exports.postComments = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    const { body, username } = req.body;

    if (!username || !body) {
      return res.status(400).send({ msg: "Missing required fields" });
    }

    const articleExists = await db.query(
      `SELECT * FROM articles WHERE article_id = $1`,
      [article_id]
    );

    if (!articleExists.rows.length) {
      return res.status(404).send({ msg: "Article not found" });
    }

    const newComment = await insertComments(article_id, body, username);

    res.status(201).send(newComment);

  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).send({ msg: "User not found" });
    }
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

