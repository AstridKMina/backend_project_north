const response = require("express");
const db = require("../db/connection");
const { fetchUsers, fetchUsersByUsername } = require("../models/users.model");

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

 exports.getUsersByUsername = async (req, res, next) => {
    try {

        const { username } = req.params;

        if (!username || typeof username !== "string" || username.trim() === "" || !/^[a-zA-Z0-9_]+$/.test(username)) {
            throw {status: 400, msg: "Invalid username provided" };
        }

        const userObtained = await fetchUsersByUsername(username);
       
        if (!userObtained.length) {

            throw { status: 404, msg: "User not found" };
        }

        return res.status(200).send(userObtained);

    } catch (err) {
        next(err)
    }
}


