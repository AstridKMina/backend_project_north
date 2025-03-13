const db = require("../db/connection");


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

exports.insertComments = async (article_id, body, username) => {
  try {
    const insertCommentsQuery = `
 INSERT INTO comments 
 (article_id, body, author) 
         VALUES ($1, $2, $3)
         RETURNING comment_id, article_id, body, author, created_at;`

    const commentValues = [article_id, body, username];

    const insertResult = await db.query(insertCommentsQuery, commentValues);

    return insertResult.rows[0];

  } catch (err) {
    throw err
  }
};

exports.eliminateComment = async (comment_id) => {
  try {
    const checkQuery = `
        SELECT * FROM comments WHERE comment_id = $1;
      `;
    const checkResult = await db.query(checkQuery, [comment_id]);

    if (checkResult.rows.length === 0) {
      return [];
    }

    const query = `
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;
      `;
    const queryParams = [comment_id];
    const deleteResult = await db.query(query, queryParams);

    return deleteResult.rows;
  } catch (err) {
    throw err;
  }
};

exports.commentsVotesById = async (comment_id, inc_votes) => {

  try {

    const query1 = `SELECT *
  FROM comments
  WHERE comment_id = $1
  ;`

    const existedComment = await db.query(query1, [comment_id]);

    if (existedComment.rows.length === 0) {
      return [];
    };


    const query2 = `
  UPDATE comments 
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`

    const queryParams = [inc_votes, comment_id];

    const commentVotes = await db.query(query2, queryParams);

    return commentVotes.rows[0];

  } catch (err) {
    throw err
  }
};