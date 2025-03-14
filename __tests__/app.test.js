const endpointsJson = require("../endpoints.json");
const request = require("supertest")/* Set up your test imports here */
const app = require("../app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data");
require("jest-sorted")


/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of objects of topics", async () => {

    const response = await request(app)
      .get("/api/topics")
      .expect(200);

    const topics = response.body

    expect(topics).toBeInstanceOf(Array);
    expect(topics.length).toBeGreaterThan(0);

    topics.forEach((topic) => {
      expect(topic).toHaveProperty("slug")
      expect(topic).toHaveProperty("description")
    })
  });
  test("404: Responds with an error when not topics found", async () => {
    await db.query("DELETE FROM topics;");

    const response = await request(app)
      .get("/api/topics")
      .expect(404);

    const error = response.body

    expect(error).toEqual({ msg: "Topics not found" });
  });
});

describe("Articles endpoints test", () => {

  describe("GET /api/articles/:article_id", () => {
    test("200: Responds with an article filter by id", async () => {

      const response = await request(app)
        .get("/api/articles/1")
        .expect(200);

      const article = response.body

      expect(article).toBeInstanceOf(Object);

      expect(article).toHaveProperty("author")
      expect(article).toHaveProperty("title")
      expect(article).toHaveProperty("article_id")
      expect(article).toHaveProperty("body")
      expect(article).toHaveProperty("topic")
      expect(article).toHaveProperty("created_at")
      expect(article).toHaveProperty("votes")
      expect(article).toHaveProperty("article_img_url")
      expect(article).toHaveProperty("comment_count")
    });
    test("400: Responds with an error message for invalid article_id", async () => {

      const response = await request(app)
        .get("/api/articles/h")
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid article_id" });

    });
    test("404: Responds with an error message for not found article_id", async () => {

      const response = await request(app)
        .get("/api/articles/9099")
        .expect(404);

      const error = response.body;

      expect(error).toEqual({ msg: "Article not found" });
    });
    describe("comment_count property", () => {
      test("200: Responds with an article including comment_count", async () => {

        const response = await request(app)
          .get("/api/articles/1")
          .expect(200);

        const article = response.body

        expect(article).toBeInstanceOf(Object);

        expect(isNaN(article.comment_count)).toBe(false);
        expect(article).toHaveProperty("comment_count");

      });
      test("200: Responds with comment_count= 0 if no comments ", async () => {

        const response = await request(app)
          .get("/api/articles/2")
          .expect(200);

        const article = response.body

        expect(article.comment_count).toBe(0);

      });
      test("400: Responds with an error message for invalid article_id", async () => {

        const response = await request(app)
          .get("/api/articles/h")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid article_id" });

      });
      test("404: Responds with an error message for not found article_id", async () => {

        const response = await request(app)
          .get("/api/articles/9099")
          .expect(404);

        const error = response.body;

        expect(error).toEqual({ msg: "Article not found" });
      })
    });
  });
  describe("GET /api/articles", () => {
    test("200: Responds with an array of articles objects", async () => {

      const response = await request(app)
        .get("/api/articles")
        .expect(200);

      const articles = response.body


      expect(articles).toBeInstanceOf(Array);
      expect(articles.length).toBeGreaterThan(0);

      articles.forEach((article) => {
        expect(article).toHaveProperty("author")
        expect(article).toHaveProperty("title")
        expect(article).toHaveProperty("article_id")
        expect(article).toHaveProperty("comment_count")
        expect(article).toHaveProperty("topic")
        expect(article).toHaveProperty("created_at")
        expect(article).toHaveProperty("votes")
        expect(article).toHaveProperty("article_img_url")
      });
    });
    test("404: Responds with an error when not articles found", async () => {
      await db.query("DELETE FROM articles;");

      const response = await request(app)
        .get("/api/articles")
        .expect(404);

      const error = response.body

      expect(error).toEqual({ msg: "Articles not found" });
    });

    describe("GET /api/articles?order=asc", () => {
      test("200: Responds with articles order in ascending order by created_at", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=ASC")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("created_at", { ascending: true });
      });

      test("200: Responds with articles order in descending order by created_at", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=DESC")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("created_at", { descending: true });

      });
      test("400: Responds with an error message for invalid sort_by", async () => {

        const response = await request(app)
          .get("/api/articles?sort_by=invalid_column&order=asc")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid sort_by column" });
      });

      test("400: Responds with an error message if order is invalid", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=invalid")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid order value" });
      });
    });
    describe("GET /api/articles?order=desc", () => {
      test("200: Responds with articles order in descending order by created_at", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=DESC")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("created_at", { descending: true });
      });

      test("200: Responds with articles order in ascending order by author", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=author&order=ASC")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("author", { ascending: true });

      });

      test("200: Defaults to descending order when order is not provided", async () => {
        const response = await request(app)

          .get("/api/articles?sort_by=created_at")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("created_at", { descending: true });

      });
      test("200: Defaults to created_at when sort_by is not provided", async () => {
        const response = await request(app)

          .get("/api/articles?order=ASC")
          .expect(200)

        const result = response.body

        expect(result).toBeSortedBy("created_at", { ascending: true });

      });

      test("400: Responds with an error message for invalid sort_by", async () => {

        const response = await request(app)
          .get("/api/articles?sort_by=invalid_column&order=asc")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid sort_by column" });
      });

      test("400: Responds with an error message if order is invalid", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=invalid")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid order value" });
      });
    });
    describe("GET /api/articles?topic=anything", () => {
      test("200: Responds with articles filter for topic value", async () => {
        const response = await request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)

        const articlesByTopic = response.body

        expect(articlesByTopic).toBeInstanceOf(Array);

        expect(articlesByTopic.length).toBeGreaterThan(0);
        expect(articlesByTopic.every((article) => { return article.topic === "mitch" })).toBe(true);

      });
      test("200: Responds with articles when not topic value", async () => {
        const response = await request(app)
          .get("/api/articles")
          .expect(200)

        const articlesByTopic = response.body

        expect(articlesByTopic).toBeInstanceOf(Array);

        expect(articlesByTopic.length).toBeGreaterThan(0);

      });
      test("404: Responds with an error message topic not found", async () => {

        const response = await request(app)
          .get("/api/articles?topic=nonexistent_topic")
          .expect(404);

        const error = response.body

        expect(error).toEqual({ msg: "Topic not found" });
      });

      test("400: Responds with an error message if order is invalid", async () => {
        const response = await request(app)
          .get("/api/articles?sort_by=created_at&order=invalid")
          .expect(400);

        const error = response.body

        expect(error).toEqual({ msg: "Invalid order value" });
      });
    });
  });
  describe("GET /api/articles/:article_id/comments", () => {
    test("200: Responds with an array of comments objects", async () => {

      const response = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);

      const comments = response.body

      expect(comments).toBeInstanceOf(Array);
      expect(comments.length).toBeGreaterThan(0);

      comments.forEach((comment) => {
        expect(comment).toHaveProperty("author")
        expect(comment).toHaveProperty("comment_id")
        expect(comment).toHaveProperty("article_id")
        expect(comment).toHaveProperty("body")
        expect(comment).toHaveProperty("created_at")
        expect(comment).toHaveProperty("votes")
      })
      expect(comments).toBeSortedBy("created_at", { descending: true });
    })
    test("200: Responds with an array of comments sorted by created_at in descending order", async () => {

      const response = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);

      const comments = response.body

      expect(comments).toBeSortedBy("created_at", { descending: true });
    })
    test("200: Responds with an empty array when not comments found", async () => {

      const response = await request(app)
        .get("/api/articles/2/comments")
        .expect(200);

      const comments = response.body

      expect(comments).toBeInstanceOf(Array);
      expect(comments.length).toBe(0);
      expect(comments).toEqual([]);

    });
    test("400: Responds with an error message for invalid article_id", async () => {

      const response = await request(app)
        .get("/api/articles/invalid_id/comments")
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid article_id" });

    })
    test("404: Responds with an error message for not found article_id", async () => {

      const response = await request(app)
        .get("/api/articles/999/comments")
        .expect(404);

      const error = response.body;

      expect(error).toEqual({ msg: "Article not found" });
    })
  });
  describe("POST /api/articles/:article_id/comments", () => {
    test("201: Responds with a insert comment ", async () => {
      const newComment = { username: "butter_bridge", body: "Great article!" };

      const response = await request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201);

      const comment = response.body

      expect(comment).toBeInstanceOf(Object);


      expect(comment).toHaveProperty("author");
      expect(comment).toHaveProperty("article_id");
      expect(comment).toHaveProperty("body");
      expect(comment).toHaveProperty("comment_id");
      expect(comment).toHaveProperty("created_at");
      expect(comment.article_id).toBe(1);
      expect(comment.author).toBe("butter_bridge");
      expect(comment.body).toBe("Great article!");
    })
    test("400: Responds with an error message for missing body field", async () => {
      const newComment = { username: "butter_bridge" };

      const response = await request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Missing required fields" });

    })
    test("400: Responds with an error message for missing username field", async () => {
      const newComment = { body: "Great article!" };

      const response = await request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Missing required fields" });

    })
    test("404: Responds with an error message for not found article_id", async () => {

      const response = await request(app)
        .get("/api/articles/999/comments")
        .expect(404);

      const error = response.body;

      expect(error).toEqual({ msg: "Article not found" });
    })
    test("404: Responds with an error message for not found user", async () => {
      const newComment = { username: "astrid_mina", body: "Great article!" };

      const response = await request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(404);

      const error = response.body;

      expect(error).toEqual({ msg: "User not found" });
    })
  });
  describe("PATCH /api/articles/:article_id", () => {
    test("200: Updates the article votes and responds with the updated article", async () => {
      const response = await request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 5 })
        .expect(200);

      expect(response.body).toMatchObject({
        article_id: 1,
        votes: expect.any(Number),
      });

      const article = response.body

      expect(article.votes).toBeGreaterThan(0);
    });
    test("400: Responds with an error when 'article_id' is not a number", async () => {
      const response = await request(app)
        .patch("/api/articles/invalid_id")
        .send({ inc_votes: 3 })
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid article_id" });
    });

    test("400: Responds with an error when 'inc_votes' is missing", async () => {
      const response = await request(app)
        .patch("/api/articles/1")
        .send({})
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Missing required fields" });
    });

    test("400: Responds with an error when 'inc_votes' is not a number", async () => {
      const response = await request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "invalid" })
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid request body" });
    });

    test("404: Responds with an error when article_id does not exist", async () => {
      const response = await request(app)
        .patch("/api/articles/9999")
        .send({ inc_votes: 1 })
        .expect(404);

      const error = response.body

      expect(error).toEqual({ msg: "Article not found" });
    });
  });
  describe("POST /api/articles", () => {
    test("201: Respond with a new article", async () => {

      const newArticle = { title: "Code to feel alive", topic: "mitch", author: "butter_bridge", body: "we are learning coding" }

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201);

      const article = response.body

      console.log(article, "me agrgue o no")

      expect(article).toHaveProperty("author")
      expect(article).toHaveProperty("title")
      expect(article).toHaveProperty("article_id")
      expect(article).toHaveProperty("body")
      expect(article).toHaveProperty("topic")
      expect(article).toHaveProperty("created_at")
      expect(article).toHaveProperty("votes")
      expect(article).toHaveProperty("article_img_url")
      expect(article).toHaveProperty("comment_count")


      expect(article).toMatchObject({
        title: "Code to feel alive",
        topic: "mitch",
        author: "butter_bridge",
        body: "we are learning coding",
        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        votes: 0,
        comment_count: expect.any(Number)
      });
      expect(article.votes).toBe(0);
    });
    test('201: Respond with a default image if article_img_url is not provided', async () => {
      const newArticle = {
        title: "Code to feel alive",
        topic: "mitch",
        author: "butter_bridge",
        body: "we are learning coding"
      }

      const response = await request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201);

      const article = response.body

      expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
    });
    test("400: Respond a error message if we have a missing required field", async () => {
      const newArticle = { topic: "mitch", author: "butter_bridge", body: "we are learning coding" }

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Missing required fields: author, title, body, and topic are required." });

    });
    test("400: Respond a error message if author value isn't correct", async () => {
      const newArticle = { title: "Code to feel alive", topic: "mitch", author: "invalid", body: "we are learning coding" }

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid reference. Topic or author does not exist." });

    });
    test("400: Respond a error message if topic value isn't correct", async () => {
      const newArticle = { title: "Code to feel alive", topic: "invalid", author: "butter_bridge", body: "we are learning coding" }

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid reference. Topic or author does not exist." });
    });
    test("400: Respond with an error when extra fields are sent", async () => {
      const newArticle = {
        title: "Code to feel alive",
        topic: "mitch",
        author: "butter_bridge",
        body: "we are learning coding",
        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        extra_field: "This should not be here"
      };

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400);

      const error = response.body;

      expect(error).toEqual({ msg: "Invalid field(s) provided: extra_field. Please provide only the allowed fields." });
    });
    test("400: Invalid URL format", async () => {
      const newArticle = {
        title: "Code to feel alive",
        topic: "mitch",
        author: "butter_bridge",
        body: "we are learning coding",
        article_img_url: "invalid_url"
      };

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400);

      const error = response.body;

      expect(error).toEqual({ msg: "Invalid URL format. Please provide a valid URL for the image." });
    });





  });
});

describe("Commments endpoints test", () => {
  describe("DELETE /api/comments/:comment_id", () => {
    test("200: Delete the comment by id", async () => {
      const response = await request(app)
        .delete("/api/comments/1")
        .expect(200);

      const comment = response.body

      expect(comment).toEqual({ msg: "Comment deletion was sucessed" });
    });
    test("400: Responds with an error when 'comment_id' is not a number", async () => {
      const response = await request(app)
        .delete("/api/comments/invalid_id")
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid comment_id" });
    });
    test("404: Responds with an error when comment_id does not exist", async () => {
      const response = await request(app)
        .delete("/api/comments/9999")
        .expect(404);

      const error = response.body

      expect(error).toEqual({ msg: "Comment not found" });
    });

  });

  describe("PATCH /api/comments/:comment_id", () => {
    test('200: Responds with an update vote of a comment successfully', async () => {
      const response = await request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 1 })
        .expect(200);

      const comment = response.body

      expect(comment.msg).toBe('Votes updated successfully');
      expect(comment.updatedComment).toHaveProperty('votes');

    });
    test('404: Responds an error if the comment does not exist ', async () => {
      const response = await request(app)
        .patch('/api/comments/999')
        .send({ inc_votes: 1 })
        .expect(404);

      const comment = response.body


      expect(comment).toEqual({ msg: 'The comment does not exist' });
    });
    test('400: Responds an error if inc_votes is not a number', async () => {
      const response = await request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 'inc_votes-not-a-number' })
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: 'Invalid format: provide a number' });
    });
    test('400: Respond an error if comment_id is not a number', async () => {
      const response = await request(app)
        .patch('/api/comments/comment_invalid_id')
        .send({ inc_votes: 5 })
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: 'Invalid format: provide a number' });
    });
  });

});

describe("Users endpoints test", () => {
  describe("GET /api/users", () => {
    test("200: Responds with an array of users objects", async () => {

      const response = await request(app)
        .get("/api/users")
        .expect(200);

      const users = response.body

      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);

      users.forEach((user) => {
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("avatar_url");
      })
    });
    test("404: Responds with an error when not users found", async () => {
      await db.query("DELETE FROM users;");

      const response = await request(app)
        .get("/api/users")
        .expect(404);

      const error = response.body

      expect(error).toEqual({ msg: "Users not found" });
    });
  });
  describe("GET /api/users/:username", () => {
    test("200: Responds with an array with an user filter by id", async () => {

      const response = await request(app)
        .get("/api/users/butter_bridge")
        .expect(200);

      const user = response.body

      expect(user).toBeInstanceOf(Array);
      expect(user.length).toBeGreaterThan(0);

      user.forEach((user_username) => {
        expect(user_username).toHaveProperty("name");
        expect(user_username).toHaveProperty("username");
        expect(user_username).toHaveProperty("avatar_url");
      })
    });
    test("400: Responds with an error when invalid user provided", async () => {
      const response = await request(app)
        .get("/api/users/$")
        .expect(400);

      const error = response.body

      expect(error).toEqual({ msg: "Invalid username provided" });
    });
    test("404: Responds with an error when not user found", async () => {
      await db.query("DELETE FROM users;");

      const response = await request(app)
        .get("/api/users/notExistedUser")
        .expect(404);

      const error = response.body

      expect(error).toEqual({ msg: "User not found" });
    });
  });
})
