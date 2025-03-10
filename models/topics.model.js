const db = require("../db/connection");


exports.fetchAllTopics = async () => {
    try {
        let baseQuery = `
        SELECT
        slug, description
        FROM topics`;
    
        const result = await db.query(baseQuery);
        console.log("DB Query Result:");
        return result.rows;

    } catch(err) {

    }
 
}
