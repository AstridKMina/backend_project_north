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

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an article filter by id", async () => {

    const response = await request(app)
      .get("/api/articles/1")
      .expect(200);

    const articles = response.body

    expect(articles).toBeInstanceOf(Array);
    expect(articles.length).toBeGreaterThan(0);

    articles.forEach((article) => {
      expect(article).toHaveProperty("author")
      expect(article).toHaveProperty("title")
      expect(article).toHaveProperty("article_id")
      expect(article).toHaveProperty("body")
      expect(article).toHaveProperty("topic")
      expect(article).toHaveProperty("created_at")
      expect(article).toHaveProperty("votes")
      expect(article).toHaveProperty("article_img_url")
    });
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

      expect(article).toBeInstanceOf(Array);
      expect(article.length).toBeGreaterThan(0);

      console.log(article, "adivina donde estoy")

      expect(isNaN(Number(article.comment_count))).toBe(true);
      article.forEach((article_comment) => {
        expect(article_comment).toHaveProperty("comment_count");
      });
    });
    test("200: Responds with comment_count= 0 if no comments ", async () => {

      const response = await request(app)
        .get("/api/articles/2")
        .expect(200);

      const article = response.body

      article.forEach((article_comment) => {
        expect(article_comment.comment_count).toBe("0");
      });
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
    expect(comments).toBeSortedBy("created_at" , { descending: true });
  })
  test("200: Responds with an array of comments sorted by created_at in descending order", async () => {

    const response = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);

    const comments = response.body

    expect(comments).toBeSortedBy("created_at" , { descending: true });
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
})

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