
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', t => {
    t.increments('id').primary();
    t.string('u_fname').notNullable();
    t.string('u_sname').notNullable();
    t.string('u_role').notNullable();
    t.string('u_mobileNo').notNullable();
    t.boolean('u_admin').notNullable().default(false);
    t.string('u_password').notNullable();
    t.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user');
};
