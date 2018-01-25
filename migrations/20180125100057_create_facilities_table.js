
exports.up = function(knex, Promise) {
  return knex.schema.createTable('facility', t => {
    t.increments('f_id').primary();
    t.string('f_name').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('facility');
};
