# NC News Seeding

Project: backend_api_project_

This API provides a set of endpoints to interact with articles, comments, users, and topics related to news articles. It's designed to allow users to view articles, post comments, and interact with different topics, all through a RESTful API.

Hosted Version
You can access the hosted version of the project at the following link:

https://articles-backend-project.onrender.com/api

Summary
This project is a RESTful API built with Node.js and PostgreSQL, providing functionality for retrieving articles, posting and deleting comments, managing topics, accessing user data and update articles votes.

The application includes several endpoints for interacting with articles, topics, comments, and users. You can retrieve articles by their IDs, fetch all articles with sorting and filtering capabilities, post new comments, and more. The project is structured in a way that promotes clean, maintainable code and proper error handling.


- Instructions for this sprint:

1. Clone the repository

To get started, clone the repository to your local machine:

git clone https://github.com/AstridKMina/backend_project_north
cd backend_project_north

2. Install Dependencies

In the project directory, run the following command to install the necessary dependencies:

npm install

3. Set up the Database

To set up the database locally, you need to create a PostgreSQL database and set up some initial data.

Create the database: In PostgreSQL, create a new database for the application. You can do this using the following SQL command:

DROP DATABASE IF EXISTS nc_news;
CREATE DATABASE nc_news;

DROP DATABASE IF EXISTS nc_news_test;
CREATE DATABASE nc_news_test;


Create the tables: Run the migrations or seed the database using the provided SQL files (or use a tool like pgAdmin or psql to execute the SQL). These scripts are typically located in the db/ directory.

psql -f ./db/setup-dbs.sql

Set up the .env file: Create two .env files to configure the project:

Create Files:
	1.	.env.development: For general project configuration
	2.	.env.test: For testing purposes.

    and insert PGDATABASE=name_database in both of them.

4. Running Tests

To run the tests for the project, use the following command:

npm test

This will run the test suite and check that everything is functioning as expected.

5. Start the Server

To start the server locally and begin interacting with the API, use the following command:

npm start

This will run the API on the port defined in your .env file.

Minimum Version Requirements
Node.js: 14.x or higher
PostgreSQL: 12.x or higher

Endpoints

Here are some of the main API endpoints available:

GET /api/topics: Retrieve a list of all topics.
GET /api/articles: Get a list of all articles with optional filters for sorting and topics.
GET /api/articles/:article_id: Get a specific article by its ID.
GET /api/articles/:article_id/comments: Get all comments for a specific article.
POST /api/articles/:article_id/comments: Post a new comment on an article.
PATCH /api/articles/:article_id: Update the vote count of a specific article.
DELETE /api/comments/:comment_id: Delete a comment by its ID.
GET /api/users: Get a list of all users.
