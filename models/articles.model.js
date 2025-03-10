const db = require("../db/connection");


exports.fetchArticlesById = async (article_id) => {
    try {
        let baseQuery = `
     SELECT a.article_id, a.title, a.body, a.created_at, a.votes, a.article_img_url,
       u.username AS author, t.slug AS topic
FROM articles a
LEFT JOIN users u ON a.author = u.username
LEFT JOIN topics t ON a.topic = t.slug
WHERE a.article_id = $1;`


        const queryParams = [article_id];
        const result = await db.query(baseQuery, queryParams);
       
        if (!result.rows.length) {
            console.log("No article found with the given ID");
            throw new Error("Article not found");
        }
        
        // console.log("DB Query Result:", result.rows[0]);
        return result.rows[0];

    } catch (err) { }
}
