const User = require('../models/User');
const Facility = require('../models/Facility');
module.exports = exports = {
  async createNewUser (details) {
    console.log('post recieved to create new user');
    console.log('userDetails: ', details);
    try {
      const user = await User.query().insert({
        u_fname: details.fname,
        u_sname: details.sname,
        u_role: details.role,
        u_mobileNo: details.mobile,
        u_admin: details.admin,
        u_password: details.password,
        u_email: details.email
      });
      console.log('new user', user);
      return {success: true, data: user}
    } catch (e){
      console.log('error', e);
      return {success: false, error: e}
    }
  },
  async createFacility (details) {
    console.log('attempting to create new facility with ', details);
    try {
      const facility = await Facility.query().insert(details);
      return {success: true, data: facility}
    } catch (e) {
      console.log('error occurred while saving facility', e);
      return {success: false, error: e}
    }
  },
  async fetchFacilities () {
    console.log('attempting to fetch facilities details');
    try {
      const facilities = await Facility.query();
      console.log('facilities fetched', facilities);
      return {success: true, data: facilities}
    }catch(e){
      console.log('error fetching facilities', e);
      return {success: false, data: {}, error: e}
    }
  },
  async fetchFacilityById (id) {
    console.log('attempting to fetch facility with ID ', id);
    try {
      const facility = await Facility.query().where({id: id});
      return {success: true, data: facility}
    }catch(error){
      console.log('error fetching facilities', e);
      return { success: false, error, msg: 'an error occurred while fetching facility' }
    }
  },
  async updateFacility (id, { name }) {
    console.log('request recived to update facility name to', name, ' with id ', id);
    try {
      const facility = await Facility.query().patchAndFetchById(id, {'f_name': name});
      console.log('queried for facility', facility.toJSON());
      if(!facility) return {success: false, data: {}, msg: 'facility not found'};
      console.log('facility exists');
      return {success: true, data: facility}
    }catch(error){
      console.log('error fetching facilities', error);
      return { success: false, error, msg: 'an error occurred while fetching facility' }
    }
  },
  async requestAdminStatus(email) {
    const result = await exports.fetchUserByEmail(email);
    if(!result.success) return result;
    const user = Object.assign({}, result.data);
    if(user.u_admin && user.u_adminConfirmed) return {success: false, msg: 'user is already an admin'};
    if(user.u_admin && !user.u_adminConfirmed) return {success: false, msg: 'user has already requested admin status'};
    const updateResult = await exports.updateUser(user.id, {admin: true, adminConfirmed: false})
    console.log('update successful?', updateResult.success);
    return updateResult;
  },
  async fetchUserByEmail(email){
    console.log('attempting to fetch user', email);
    try{
      const user = await User.query().where({u_email: email});
      console.log('user fetched');
      if (!user || Object.keys(user).length === 0) return {success: false, msg: 'user does not exist'};
      return {success: true, data: user}
    }catch (error){
      console.log('erorr fetching user', error);
      return {success: false, msg: 'erorr fetching user', error}
    }
  },
  async fetchUserById (id) {
    console.log('attempting to fetch user with id', id);
    try{
      const user  = await User.query().where({id});
      console.log('user fetched', user);
      if (!user || Object.keys(user).length === 0) return {success: false, msg: 'user does not exist'};
      return {success: true, data: user};
    }catch (error){
      console.log('erorr fetching user', error);
      return {success: false, msg: 'erorr fetching user', error}
    }
  },
  async setUserAsAdmin (id){
    console.log('attempting to set user', id, 'as admin');
    const result = await exports.updateUser(id, {admin: true, adminConfirmed: true});
    console.log('successful update?', result.success);
    return result
  },
  async requestAdminStatus (id) {
    console.log('user with id', id, 'requesting admin status');
    const userFetchResult = await exports.fetchUserById(id);
    if(!userFetchResult.success) return userFetchResult;
    const user = userFetchResult.data;
    console.log('fetched user', user);
    if(!!user[0].u_adminConfirmed) return {success: false, msg: 'user is already admin'};
    if(!!user[0].u_admin) return {success: false, msg: 'user has already requested admin status'};
    return exports.updateUser(id, {admin: true});
  },
  async updateUser (id, details){
    details = JSON.parse(JSON.stringify(sanitzeUserDetails(details)));
    console.log('sanitised details: ', details);
    try {
      const user = await User.query().patchAndFetchById(id, details);
      console.log('queried for user', user);
      if(!user) return {success: false, data: {}, msg: 'user not found'};
      console.log('user exists');
      return {success: true, data: user}
    }catch(error){
      console.log('error updating  user', error);
      return { success: false, error, msg: 'an error occurred while updating user' }
    }
  }
};

const sanitzeUserDetails = details => ({
  u_fname: details.fname,
  u_sname: details.sname,
  u_role: details.role,
  u_admin: details.admin || false,
  u_adminConfirmed: details.adminConfirmed || false,
  u_mobile: details.mobile,
  u_password:details.password,
  u_email: details.email
});
