const {
  convertTimestampToDate, formatTopics, formatUsers, formatArticles, formatComments
} = require("../db/seeds/utils");


describe('Utils Functions', () => {

  describe("convertTimestampToDate", () => {
    test("returns a new object", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      const result = convertTimestampToDate(input);
      expect(result).not.toBe(input);
      expect(result).toBeObject();
    });
    test("converts a created_at property to a date", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      const result = convertTimestampToDate(input);
      expect(result.created_at).toBeDate();
      expect(result.created_at).toEqual(new Date(timestamp));
    });
    test("does not mutate the input", () => {
      const timestamp = 1557572706232;
      const input = { created_at: timestamp };
      convertTimestampToDate(input);
      const control = { created_at: timestamp };
      expect(input).toEqual(control);
    });
    test("ignores includes any other key-value-pairs in returned object", () => {
      const input = { created_at: 0, key1: true, key2: 1 };
      const result = convertTimestampToDate(input);
      expect(result.key1).toBe(true);
      expect(result.key2).toBe(1);
    });
    test("returns unchanged object if no created_at property", () => {
      const input = { key: "value" };
      const result = convertTimestampToDate(input);
      const expected = { key: "value" };
      expect(result).toEqual(expected);
    });
  });

  describe('formatTopics', () => {
    test('should format topics correctly', () => {
      const topicData = [
        { slug: 'tech', description: 'Technology topics', img_url: 'tech.jpg' },
        { slug: 'health', description: 'Health topics', img_url: 'health.jpg' }
      ];
  
      const expected = [
        ['tech', 'Technology topics', 'tech.jpg'],
        ['health', 'Health topics', 'health.jpg']
      ];
  
      const formattedTopics = formatTopics(topicData);
      expect(formattedTopics).toEqual(expected);
    });
  
    test('should handle empty topic data', () => {
      const topicData = [];
      const expected = [];
      const formattedTopics = formatTopics(topicData);
      expect(formattedTopics).toEqual(expected);
    });
  });
  
  describe('formatUsers', () => {
    test('should handle less than 4 users correctly', () => {
      const userData = [
        { username: 'user1', name: 'User One', avatar_url: 'user1.jpg' },
        { username: 'user2', name: 'User Two', avatar_url: 'user2.jpg' }
      ];
  
      const expected = [
        ['user1', 'User One', 'user1.jpg'],
        ['user2', 'User Two', 'user2.jpg']
      ];
  
      const formattedUsers = formatUsers(userData);
      expect(formattedUsers).toEqual(expected);
    });
  
    test('should return empty array for no user data', () => {
      const userData = [];
      const expected = [];
      const formattedUsers = formatUsers(userData);
      expect(formattedUsers).toEqual(expected);
    });
  });
  
  describe("formatArticles", () => {
    test("Should format articles correctly", () => {
      const articleData = [
        { created_at: "2025-01-01", title: "Article One", topic: "tech", author: "user1", body: "Content of article one", votes: 10, article_img_url: "article1.jpg" },
        { created_at: "2025-01-02", title: "Article Two", topic: "health", author: "user2", body: "Content of article two", votes: 20, article_img_url: "article2.jpg" }
      ];
      const userData = [{ username: "user1" }, { username: "user2" }];
      const topicData = [{ slug: "tech" }, { slug: "health" }];

      const expected = [
        [new Date("2025-01-01T00:00:00.000Z"), "Article One", "tech", "user1", "Content of article one", 10, "article1.jpg"],
        [new Date("2025-01-02T00:00:00.000Z"), "Article Two", "health", "user2", "Content of article two", 20, "article2.jpg"]
      ];

      expect(formatArticles(articleData, userData, topicData)).toEqual(expected);
    });

    test("Should handle empty article data", () => {
      expect(formatArticles([], [], [])).toEqual([]);
    });
  });

  describe("formatComments", () => {
    test("Should format comments correctly", () => {
      const commentData = [
        { article_title: "Article One", body: "Great article", votes: 5, author: "user1", created_at: new Date("2025-01-01T00:00:00.000Z") },
        { article_title: "Article Two", body: "Very informative", votes: 3, author: "user2", created_at: new Date("2025-01-02T00:00:00.000Z") }
      ];
      const articleData = [
        { title: "Article One", article_id: 1 },
        { title: "Article Two", article_id: 2 }
      ];

      const expected = [
        [1, "Great article", 5, "user1", new Date("2025-01-01T00:00:00.000Z")],
        [2, "Very informative", 3, "user2", new Date("2025-01-02T00:00:00.000Z")]
      ];

      expect(formatComments(commentData, articleData)).toEqual(expected);
    });

    test("Should handle empty comment data", () => {
      expect(formatComments([], [])).toEqual([]);
    });
  });

});