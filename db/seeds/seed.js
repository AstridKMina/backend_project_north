const db = require("../connection");
const format = require("pg-format");
const { 
  formatArticles, 
  formatTopics, 
  formatUsers, 
  formatComments 
} = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`DROP TABLE IF EXISTS comments`)
    .then(() => db.query(`DROP TABLE IF EXISTS articles`))
    .then(() => db.query(`DROP TABLE IF EXISTS users`))
    .then(() => db.query(`DROP TABLE IF EXISTS topics`))
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR(50) PRIMARY KEY,
          description VARCHAR(255) NOT NULL,
          img_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          avatar_url VARCHAR(1000)
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          topic VARCHAR(50) REFERENCES topics(slug) ON DELETE CASCADE,
          author VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          author VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    })
    .then(() => {
      const formattedTopicsData = formatTopics(topicData);
      const insertTopicsQuery = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *;`, 
        formattedTopicsData
      );
      return db.query(insertTopicsQuery);
    })
    .then(({ rows: insertedTopics }) => {
      const formattedUsersData = formatUsers(userData);
      const insertUsersQuery = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *;`, 
        formattedUsersData
      );
      return db.query(insertUsersQuery).then(({ rows: insertedUsers }) => ({ insertedTopics, insertedUsers }));
    })
    .then(({ insertedTopics, insertedUsers }) => {
      const formattedArticles = formatArticles(articleData, insertedUsers, insertedTopics);
      const insertArticlesQuery = format(
        `INSERT INTO articles (created_at, title, topic, author, body, votes, article_img_url) 
        VALUES %L RETURNING *;`, 
        formattedArticles
      );
      return db.query(insertArticlesQuery).then(({ rows: insertedArticles }) => ({ insertedTopics, insertedUsers, insertedArticles }));
    })
    .then(({  insertedArticles }) => {

      const formattedComments = formatComments(commentData, insertedArticles);
      
      const insertCommentsQuery = format(
        `INSERT INTO comments (article_id, body, votes, author, created_at) 
        VALUES %L RETURNING *;`, 
        formattedComments
      );
      return db.query(insertCommentsQuery);
    })
    .then(() => {
     
    });
};



module.exports = seed;

   
