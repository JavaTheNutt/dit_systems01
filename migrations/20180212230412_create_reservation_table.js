
exports.up = function(knex, Promise) {
  return knex.schema.createTable('reservation', t => {
    t.increments('id').primary();
    t.string('r_title').notNullable();
    t.string('r_description').nullable();
    t.boolean('r_approved').notNullable().default(false);
    t.integer('r_user').unsigned().references('id').inTable('user').notNullable().onDelete('cascade');
    t.integer('r_facility').unsigned().references('id').inTable('facility').notNullable().onDelete('cascade')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('reservation');
};
