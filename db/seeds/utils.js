const db = require("../../db/connection");


exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};


exports.formatTopics = (topicData) => {
  return topicData.map((topic) => {
    return [topic.slug, topic.description, topic.img_url]
  })
}

exports.formatUsers = (userData) => {
  return userData.map((user) => {
    return [user.username, user.name, user.avatar_url]
  })
}




exports.formatArticles = (articleData, userData, topicData) => {
  const usernames = userData.map(user => user.username);
  const topicSlugs = topicData.map(topic => topic.slug); 

  return articleData
    .filter(article => usernames.includes(article.author) && topicSlugs.includes(article.topic)) 
    .map(article => {
      const date = exports.convertTimestampToDate(article);
      return [
        date.created_at,
        article.title,
        article.topic,
        article.author,
        article.body,
        article.votes || 0,
        article.article_img_url
      ];
    });
};


exports.formatComments = (commentData, articleData) => {

  const articleIdMap = {};
  articleData.forEach((article) => {
    articleIdMap[article.title] = article.article_id;

  })

  return commentData.map((comment) => {
    const articleId = articleIdMap[comment.article_title]
    if (articleId !== undefined) {
      const date = exports.convertTimestampToDate(comment)
      return [articleId, comment.body, comment.votes, comment.author, date.created_at];
    }
  }).filter(Boolean);
};



