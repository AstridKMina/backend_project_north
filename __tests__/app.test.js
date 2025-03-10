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