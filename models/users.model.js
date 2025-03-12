const db = require("../db/connection");

exports.fetchUsers = async () => {

    try {
        const usersQuery = `
        SELECT *
        FROM users;`;

        const users = await db.query(usersQuery);

        return users.rows;

    } catch (err) {
        throw err
    }
}