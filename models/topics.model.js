const db = require("../db/connection");


exports.fetchAllTopics = async () => {
    try {
        let baseQuery = `
        SELECT
        slug, description
        FROM topics`;

        const result = await db.query(baseQuery);

        return result.rows;

    } catch (err) {

    }

}
