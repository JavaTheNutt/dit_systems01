
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', t => {
    t.increments('id').primary();
    t.string('u_fname').nullable();
    t.string('u_sname').nullable();
    t.string('u_role').nullable();
    t.string('u_mobileNo').nullable();
    t.boolean('u_admin').notNullable().default(false);
    t.boolean('u_adminConfirmed').notNullable().default(false);
    t.string('u_password').notNullable();
    t.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user');
};
