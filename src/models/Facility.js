const bookshelf = require('../bookshelf');
class Facility extends bookshelf.Model {
  get tableName () {
    return 'facility';
  }
}

module.exports = Facility;
