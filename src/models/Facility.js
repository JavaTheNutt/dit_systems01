const Model = require('../objection');
class Facility extends Model {
  static get tableName () {
    return 'facility';
  }
}

module.exports = Facility;
