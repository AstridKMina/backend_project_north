const db = require("../db/connection");


exports.fetchAllArticles = async (sort_by = "created_at", order = "DESC", topic, limit = 10, p = 1) => {
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
                   COUNT(c.comment_id)::INT AS comment_count
            FROM articles a
            LEFT JOIN users u ON a.author = u.username
            LEFT JOIN topics t ON a.topic = t.slug
            LEFT JOIN comments c ON a.article_id = c.article_id
       `;

        const queryParams = []
        let placeholder = 1;

        if (topic) {

            const topicExist = await db.query(`SELECT* FROM topics WHERE slug = $1;`, [topic]);

            if (topicExist.rows.length === 0) {
                throw { status: 404, msg: "Topic not found" };
            }

            baseQuery += ` WHERE t.slug = $${placeholder}`;
            queryParams.push(topic)
            placeholder++
        }

        baseQuery += ` GROUP BY a.article_id, a.title, a.created_at, a.votes, a.article_img_url, u.username, t.slug`;
        baseQuery += ` ORDER BY ${sort_by} ${order.toUpperCase()} `;

        const offset = (p - 1) * limit;

        baseQuery += `LIMIT $${placeholder} OFFSET $${placeholder + 1};`;

        queryParams.push(limit, offset);

        console.log("vamos para la playa")

        const result = await db.query(baseQuery, queryParams);

        console.log("vamos para la playa ps no te llevo")

        let countQuery = `
        SELECT COUNT(*) AS total_count
        FROM articles a
        LEFT JOIN users u ON a.author = u.username
        LEFT JOIN topics t ON a.topic = t.slug
        LEFT JOIN comments c ON a.article_id = c.article_id
    `;

    if (topic) {
        countQuery += ` WHERE t.slug = $1`;
    }

    const countResult = await db.query(countQuery, topic ? [topic] : []);

  
    const totalCount = countResult.rows[0].total_count;

 
    return {
        articles: result.rows,
        total_count: totalCount
    };


    } catch (err) {
        throw err;
    };
};

exports.fetchArticleById = async (article_id) => {
    try {
        const articleQuery = `
     SELECT a.article_id, a.title, a.body, a.created_at, a.votes, a.article_img_url,
       u.username AS author, t.slug AS topic,
       COUNT(c.comment_id)::INT AS comment_count
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
};

exports.insertArticle = async (title, topic, author, body, article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700") => {

    try {

        const query = `
INSERT INTO articles
(title, topic, author, body, article_img_url)
VALUES ($1, $2, $3, $4, $5) 
RETURNING *;
`
        const queryParams = [title, topic, author, body, article_img_url];


        const newArticle = await db.query(query, queryParams);

        const getCommentCount = await this.fetchArticleById(newArticle.rows[0].article_id);
        const commentCount = getCommentCount.comment_count;


        newArticle.rows[0].comment_count = commentCount;

        return newArticle.rows[0];

    } catch (err) {
        throw err
    }
}

