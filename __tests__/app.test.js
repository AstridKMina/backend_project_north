const endpointsJson = require("../endpoints.json");
const request = require("supertest")/* Set up your test imports here */
const app = require("../app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data");


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
  test("200: Responds with an array of topic objects", async () => {

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
  })

});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with an array of articles objects", async () => {

    const response = await request(app)
      .get("/api/articles/1")
      .expect(200);

    const articles = response.body

    expect(articles).toBeInstanceOf(Object);
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
    })
  })
  test("400: Responds with an error message for invalid article_id", async () => {

    const response = await request(app)
      .get("/api/articles/h")
      .expect(400);

    const error = response.body

    expect(error).toEqual({ msg: "Invalid article_id" });

  })
  test("404: Responds with an error message for not found article_id", async () => {

    const response = await request(app)
      .get("/api/articles/9099")
      .expect(404);
  
      const error = response.body;
  
      expect(error).toEqual({ msg: "Article not found" });
  

  })
})


