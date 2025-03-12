const db = require("../db/connection");



exports.fetchAllArticles = async (sort_by = "created_at", order = "ASC") => {
    try {
        const validSortColumns = ["created_at", "article_id", "title", "votes", "article_img_url", "author", "topic", "comment_count"];

        const validOrderValues = ["ASC", "DESC"];

        if (!validSortColumns.includes(sort_by)) {
            throw { status: 400, msg: "Invalid sort_by column" };

        }
        if (!validOrderValues.includes(order.toUpperCase())) {
            throw { status: 400, msg: "Invalid order value" };
        }

        let baseQuery = `
            SELECT a.article_id, a.title, a.created_at, a.votes, a.article_img_url,
                   u.username AS author, t.slug AS topic,
                   COUNT(c.comment_id) AS comment_count
            FROM articles a
            LEFT JOIN users u ON a.author = u.username
            LEFT JOIN topics t ON a.topic = t.slug
            LEFT JOIN comments c ON a.article_id = c.article_id
            GROUP BY a.article_id, a.title, a.created_at, a.votes, a.article_img_url, u.username, t.slug
            ORDER BY ${sort_by} ${order.toUpperCase()}
        ;`;

        const result = await db.query(baseQuery);

        return result.rows;

    } catch (err) {
        throw err;
    }
};

exports.fetchArticleById = async (article_id) => {
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
        return result.rows[0];

    } catch (err) { }
}

exports.fetchArticleCommentsById = async (article_id) => {
    try {

        const commentsQuery = `SELECT c.body, c.comment_id, c.votes, c.created_at,
         c.article_id, 
               c.author
FROM comments c
WHERE c.article_id = $1
ORDER BY created_at DESC
`

        const queryParams = [article_id];

        const commentsResult = await db.query(commentsQuery, queryParams);

        if (!commentsResult.rows.length) {
            return []
        }

        return commentsResult.rows;

    } catch (err) {
    }
};
