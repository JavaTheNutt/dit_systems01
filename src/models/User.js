const bookshelf = require('../bookshelf');
const bcrypt = require('bcrypt');
class User extends bookshelf.Model{
  get tableName () {
    return 'user'
  }

  async initialize () {
    this.on('creating', await this.hashPassword, this)
  }

  async hashPassword (model, attrs, options) {
    try {
      const hash = await bcrypt.hash(model.attributes.u_password, 10);
      model.set('u_password', hash);
      console.log('password hash succeeded');
      return hash;
    }catch (e) {
      console.log('password hash failed', e);
    }
  }
}

module.exports = User;
