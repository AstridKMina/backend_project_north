const response = require("express");
const db = require("../db/connection");
const { fetchAllTopics } = require("../models/topics.model");


exports.getTopics = async (req, res, next) => {
    try {

        const topics = await fetchAllTopics();

        if (topics.length === 0) {
            throw { status: 404, msg: "Topics not found" };
        }

        res.status(200).send(topics);

    } catch (err) {
        next(err)
    }
}