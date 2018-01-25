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
  }
};
