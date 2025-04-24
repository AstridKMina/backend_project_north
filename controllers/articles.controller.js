const db = require("../db/connection");
const { fetchArticleById, fetchAllArticles, updateArticleById, insertArticle } = require("../models/articles.model");


exports.getAllArticles = async (req, res, next) => {
  try {

    const { sort_by = "created_at", order = "DESC", topic, limit=10, p=1 } = req.query;

    if (topic && typeof topic !== "string") {
      throw { status: 400, msg: "Invalid topic" }

    }

    let articles;

    if (topic) {

      articles = await fetchAllArticles(sort_by, order, topic, limit, p);

    } else {

      articles = await fetchAllArticles(sort_by, order, "", limit, p);

    };

    if (articles.articles.length === 0) {
      throw { status: 404, msg: "Articles not found" }
    }

    return res.status(200).send(articles);

  } catch (err) {
    if (err.status && err.msg) {
      return res.status(err.status).send({ msg: err.msg });
    }
    next(err)
  }
};

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

    res.status(200).send(articleById)

  } catch (err) {
    next(err)
  }
};

exports.patchArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    const { inc_votes } = req.body;

    if (isNaN(article_id) || !article_id) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }

    if (!inc_votes) {
      return res.status(400).send({ msg: "Missing required fields" });
    }

    if (typeof inc_votes !== "number") {
      return res.status(400).send({ msg: "Invalid request body" });
    }

    const updatedArticle = await updateArticleById(article_id, inc_votes)

    res.status(200).send(updatedArticle);

  } catch (err) {
    next(err)
  }
};

exports.postNewArticle = async (req, res, next) => {
  try {

    const { title, topic, author, body, article_img_url } = req.body;

    const validUrl = (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(article_img_url))

    if (article_img_url && validUrl) {
      return next({ status: 400, msg: "Invalid URL format. Please provide a valid URL for the image." });
    }

    const allowedFields = ["title", "topic", "author", "body", "article_img_url"];

    const providedFields = Object.keys(req.body);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    
  
    if (invalidFields.length > 0) {
      throw  { status: 400 , 
        msg: `Invalid field(s) provided: ${invalidFields.join(', ')}. Please provide only the allowed fields.`
      };
    }

    const postNewArticle = await insertArticle(title, topic, author, body, article_img_url);


    res.status(201).send(postNewArticle);

  } catch (err) {
    if (err.code === "23502") {
      return next({ status: 400, msg: "Missing required fields: author, title, body, and topic are required." });

    } else if (err.code === "23503") {
      return next({ status: 400, msg: "Invalid reference. Topic or author does not exist." });
     
    } 
    next(err)
  }

};
