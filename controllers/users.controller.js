const response = require("express");
const db = require("../db/connection");
const { fetchUsers } = require("../models/users.model");

exports.getUsers = async (req, res, next) => {
    try {

        const usersObtained = await fetchUsers();
       
        if (usersObtained.length === 0) {

            throw { status: 404, msg: "Users not found" };
        }

        return res.status(200).send(usersObtained);

    } catch (err) {
        next(err)
    }
}