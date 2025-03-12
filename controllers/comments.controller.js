const response = require("express");
const db = require("../db/connection");
const { insertComments, fetchArticleCommentsById, eliminateComment } = require("../models/comments.model");
const { fetchArticleById } = require("../models/articles.model");

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

exports.deleteComment = async (req, res, next) => {
    try {
        const { comment_id } = req.params;

        if(isNaN(comment_id)) {
            res.status(400).send({msg: "Invalid comment_id"});
        }

        const deleteC = await eliminateComment(comment_id);

        if (deleteC.length === 0) {
            return res.status(404).send({ msg: "Comment not found" });
          }

        res.status(200).send({msg: "Comment deletion was sucessed"})

    } catch (err) {
        next(err)
    }
}