const db = require("../db/connection");


exports.fetchAllArticles = async (sort_by = "created_at", order = "DESC", topic) => {
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
       `;

        const queryParams = []

        if (topic) {

            const topicExist = await db.query(`SELECT* FROM topics WHERE slug = $1;`, [topic]);

            if (topicExist.rows.length === 0) {
                throw { status: 404, msg: "Topic not found" };
            }

            baseQuery += ` WHERE t.slug = $1`;
            queryParams.push(topic)
        }

        baseQuery += ` GROUP BY a.article_id, a.title, a.created_at, a.votes, a.article_img_url, u.username, t.slug`;
        baseQuery += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;


        const result = await db.query(baseQuery, queryParams);

        return result.rows;


    } catch (err) {
        throw err;
    }
};

exports.fetchArticleById = async (article_id) => {
    try {
        const articleQuery = `
     SELECT a.article_id, a.title, a.body, a.created_at, a.votes, a.article_img_url,
       u.username AS author, t.slug AS topic,
       COUNT(c.comment_id) AS comment_count
FROM articles a
LEFT JOIN users u ON a.author = u.username
LEFT JOIN topics t ON a.topic = t.slug
LEFT JOIN comments c ON a.article_id = c.article_id
WHERE a.article_id = $1
GROUP BY a.article_id, u.username, t.slug; 
`;

        const queryParams = [article_id];

        const articlesResult = await db.query(articleQuery, queryParams);

        if (!articlesResult.rows.length) {
            throw new Error("Article not found");
        }

        return articlesResult.rows[0];

    } catch (err) { }
};

exports.updateArticleById = async (article_id, inc_votes) => {
    try {
        let baseQuery = `
     UPDATE articles 
     SET votes = votes + $1 
WHERE article_id = $2
RETURNING *;`;

        const queryParams = [inc_votes, article_id];
        const result = await db.query(baseQuery, queryParams)

        if (!result.rows.length) {
            throw { status: 404, msg: "Article not found" };
        }

        return result.rows[0];

    } catch (err) {
        throw err
    }
}

