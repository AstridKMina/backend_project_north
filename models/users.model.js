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

exports.fetchUsersByUsername = async (username) => {

    try {
        const usersQuery = `
        SELECT *
        FROM users
        WHERE username = $1;`;

        const queryParams = [username]

        const users = await db.query(usersQuery,queryParams);

        console.log("yo soy tu users, a que ta contenta")

        return users.rows;

    } catch (err) {
        throw err
    }
}


