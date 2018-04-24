const Model = require('../objection');
const Facility = require('./Facility');
const User = require('./User');
class Reservation extends Model {
  static get relationshipMappings () {
    return {
      facility: {
        relation: Model.BelongsToOneRelation,
        modelClass: Facility,
        join: {
          from: 'reservation.r_facility',
          to: 'facility.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reservation.r_user',
          to: 'user.id'
        }
      }

    };
  };

  static get tableName () {
    return 'reservation';
  }
}

module.exports = Reservation;
