const Model = require('../objection');
const Password = require('objection-password')({ passwordField: 'u_password'});
const bcrypt = require('bcrypt');
class User extends Password(Model){
  static get tableName () {
    return 'user'
  }
}

module.exports = User;
