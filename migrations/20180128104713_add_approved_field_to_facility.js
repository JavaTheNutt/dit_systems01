
exports.up = function(knex, Promise) {
  return knex.schema.table('facility', t => {
    t.boolean('f_approved').notNullable().default(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('facility', t => {
    t.dropColumn('f_approved');
  });
};
