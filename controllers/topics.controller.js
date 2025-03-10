const response = require("express");
const db = require("../db/connection");
const { fetchAllTopics } = require("../models/topics.model");


exports.getTopics = async (req, res, next) => {
    try {
        const topics = await fetchAllTopics();
        console.log(topics)
        res.status(200).json(topics);
    } catch (err) {
        next(err)
    }
}