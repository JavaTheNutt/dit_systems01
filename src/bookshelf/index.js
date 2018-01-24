const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST | '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'distributed_systems_assigment_one',
    charset: 'utf-8'
  }
});
module.exports = require('bookshelf')(knex);
