
exports.up = function(knex, Promise) {
  return knex.schema.createTable('facility', t => {
    t.increments('id').primary();
    t.string('f_name').notNullable().unique();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('facility');
};
