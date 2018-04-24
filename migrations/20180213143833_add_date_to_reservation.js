
exports.up = function(knex, Promise) {
  return knex.schema.table('reservation', t => {
    t.string('r_date').notNullable();
    t.integer('r_duration').notNullable().default(1);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('reservation', t => {
    t.dropColumn('r_date');
    t.dropColumn('r_duration');
  });
};
