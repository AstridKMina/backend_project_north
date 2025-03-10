const response = require("express");
const db = require("../db/connection");
const { fetchArticlesById } = require("../models/articles.model");


exports.getArticleById = async (req,res,next) => {
    try {
        const { article_id } = req.params;

        if(!article_id) {
            res.status(400).send({ msg:"Article ID is required" });
        }

        const articleById = await fetchArticlesById(article_id)
        // console.log(articleById,"articlesssssss")

        if(!articleById || articleById===0) {
            res.status(400).send({ msg:"Article not found" });
        }
        
        res.status(200).json([articleById])

    } catch (err) {
      next(err)
    }
}