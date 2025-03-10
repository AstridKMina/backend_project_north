const response = require("express");
const db = require("../db/connection");
const { fetchArticlesById } = require("../models/articles.model");


exports.getArticleById = async (req,res,next) => {
    try {
        const { article_id } = req.params;

        if (isNaN(article_id) || !article_id) {
            return res.status(400).send({ msg: "Invalid article_id" });
          }
        const articleById = await fetchArticlesById(article_id)

        if(!articleById || articleById===0) {
           return res.status(404).send({ msg:"Article not found" });
        }
        
        res.status(200).send([articleById])

    } catch (err) {
      next(err)
    }
}