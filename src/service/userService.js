const User = require('../models/User');
module.exports = exports = {
  async createNewUser (details) {
    console.log('post recieved to create new user');
    console.log('userDetails: ', details);
    try {
      await User.forge({
        u_fname: details.fname,
        u_sname: details.sname,
        u_role: details.role,
        u_mobileNo: details.mobile,
        u_admin: details.admin,
        u_password: details.password,
        u_email: details.email
      }).save();
      return {success: true}
    } catch (e){
      return {success: false, error: e}
    }
  }
};
