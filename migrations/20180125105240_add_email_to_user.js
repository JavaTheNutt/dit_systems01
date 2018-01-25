
exports.up = function(knex, Promise) {
  return knex.schema.table('user', t => {
    t.string('u_email').notNullable().unique();
  });
};

exports.down = function(knex, Promise) {
   return knex.schema.table('user', t => {
    t.dropColumn('u_email');
  });
};
