const User = require('../models/User');
const Facility = require('../models/Facility');
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
  },
  async createFacility (details) {
    console.log('attempting to create new facility with ', details);
    try {
      await new Facility({'f_name': details.name}).save();
      return {success: true}
    } catch (e) {
      console.log('error occurred while saving facility', e);
      return {success: false, error: e}
    }
  }
};
