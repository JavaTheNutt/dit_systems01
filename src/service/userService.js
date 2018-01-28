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
  async updateFacility (id, details) {
    console.log('request recived to update facility to', details, ' with id ', id);
    const updatedDetails = {};
    if(details.name){
      console.log('details has name');
      updatedDetails.f_name = details.name;
    }
    if(details.confirmed){
      console.log('details has confirmed');
      updatedDetails.f_approved = details.confirmed;
    }
    try {
      const facility = await Facility.query().patchAndFetchById(id, updatedDetails);
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
  },
  async getUnconfirmedAdmins () {
    console.log('attempting to fetch unconfirmed admins');
    try {
      const users = await User.query()
      .where('u_admin', true)
      .where('u_adminConfirmed', false);
      console.log(users.length, 'users found');
      return {success: true, data: exports.stripPasswordProps(users)}
    }catch (error) {
      console.log('error while fetching unconfirmed admin', error);
      return {success: false, error, msg: 'error while fetching unconfirmed admin'}
    }
  },
  async getUnconfirmedFacilities () {
    console.log('attempting to fetch unconfirmed facilities');
    try {
      const facilities = await Facility.query().where('f_approved', false);
      console.log(facilities.length, 'facilities found');
      return {success: true, data: facilities}
    } catch (error) {
      console.log('error while fetching unconfirmed facilities', error);
      return {success: false, error, msg: 'error while fetching unconfirmed facilities'}
    }
  },
  async getAdminRequests () {
    console.log('attempting to fetch items that require admin attentions');
    const unconfirmedAdmins = await exports.getUnconfirmedAdmins();
    if(!unconfirmedAdmins.success){
      console.log('erorr fetching unconfirmed admins');
      return unconfirmedAdmins;
    }
    const unconfirmedFacilities = await exports.getUnconfirmedFacilities();
    if(!unconfirmedFacilities.success){
      console.log('erorr fetching unconfirmed admins');
      return unconfirmedFacilities;
    }
    return {success: true, data:{admins: unconfirmedAdmins.data, facilities: unconfirmedFacilities.data}}
  },
  async refuseAdminRequest (id) {
    console.log('refusing ', id, 'admin request');
    return await exports.updateUser(id, {admin: false, adminConfirmed: false});
  },
  async confirmFacilityRequest (id) {
    console.log('confirming ', id, 'facility request');
    return await exports.updateFacility(id, {confirmed: true});
  },
  async rejectFacilityRequest (id) {
    console.log('rejecting ', id, 'facility request');
    return await exports.deleteFacility(id);
  },
  async deleteFacility (id) {
    console.log('deleting facility with id', id);
    try{
      const result = await Facility.query().delete().where('id', id);
      if(!result || result < 1) return {success: false, msg: 'nothing deleted'};
      console.log(result, 'records deleted');
      return {success: true, msg: 'item deleted'}
    }catch(error){
      console.log('error deleting item', error);
      return {success: false, msg: 'error deleting item', error}
    }
  },
  stripPasswordProps (users) {
    console.log('stripping props for: ', users);
    return users.map(user => exports.stripPasswordProp(user));
  },
  stripPasswordProp(user){
    console.log('stripping prop from: ', user);
    return Object.keys(user)
    .filter(key => key !== 'u_password')
    .reduce((obj, key) => {
      obj[key] = user[key];
      return obj;
    }, {})
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
