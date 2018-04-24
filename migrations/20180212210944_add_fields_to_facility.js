
exports.up = function(knex, Promise) {
  return knex.schema.table('facility', t => {
    t.string('f_type').notNullable();
    t.integer('f_capacity').notNullable().default(20);
    t.integer('f_number');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('facility', t => {
    t.dropColumn('f_type');
    t.dropColumn('f_capacity');
    t.dropColumn('f_number');
  });
};
