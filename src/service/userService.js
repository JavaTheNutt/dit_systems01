const User = require('../models/User');
const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');
const moment = require('moment');
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
  async fetchUsers () {
    console.log('fetching all users');
    try{
      const users = await User.query();
      console.log('users fetched', users);
      if (!users || users.length < 1) return {success: false, msg: 'no users found'};
      return {success: true, data: getOutwardUsers(users)}
    }catch (error){
      console.log('error fetching all users');
      return {success: false, msg: 'error fetching all users', error}
    }
  },
  async createReservation (details) {
    console.log('creating reservation with details');
    try{
      const reservation = await Reservation.query().insert({
        r_title: details.title,
        r_description: details.description,
        r_approved: details.approved,
        r_user: details.user,
        r_facility: details.facility,
        r_date: details.date,
        r_duration: details.duration
      });
      return {success:true, data:reservation}
    }catch (e) {
      console.log('error occurred while saving reservation', e);
      return {success: false, error: e}
    }
  },
  async deleteReservation (id) {
    console.log('attempting to delete reservation with ID', id);
    try {
      await Reservation.query().delete().where('id', id);
      return {success:true}
    }catch(error){
      console.log('error deleting facility', error);
      return {success:false};
    }
  },
  async approveReservation (id) {
    console.log('attempting to approve reservation with id', id);
    try {
      await Reservation.query().patchAndFetchById(id, {r_approved: true});
      return {success: true}
    }catch (error) {
      console.log('error approving reservation', error);
      return {success: false, error, msg: 'error approving reservation'}
    }
  },
  async fetchShortFacilities () {
    try {
      const shortList = await Facility.query().select(
          'facility.id',
          'facility.f_name'
      ).where('f_approved', true);
      return {success: true, data: shortList}
    } catch (error) {
      console.log('error fetching short facility details', error);
      return {success: false, error, message: 'error fetching short facility details'}
    }
  },
  async updateReservationFacility(reservationId, facilityId) {
    console.log('setting reservation', reservationId, 'to facility', facilityId);
    try {
      const result = await Reservation.query().patchAndFetchById(reservationId, {'r_facility': facilityId});
      return {success: true, data: result}
    } catch (error){
      console.log('error setting reservation facility', error);
      return {success: false, error}
    }
  },
  async updateReservationDuration(reservationId, duration) {
    try {
      const result = await Reservation.query().patchAndFetchById(reservationId, {'r_duration': duration});
      return {success: true, data: result};
    }catch (error){
      console.log('error setting reservation duration', error);
      return {success: false, error}
    }
  },
  async fetchAllReservations (showUnconfirmed = false) {
    console.log('attempting to fetch all reservations');
    try{
      let reservations;
      if(showUnconfirmed){
        console.log('showing all');
        reservations = await Reservation.query().select(
            'reservation.*',
            'user.u_fname as userFname',
            'user.u_sname as userSname',
            'user.u_email as userEmail',
            'user.u_mobileNo as userMobile',
            'facility.f_name as facilityName',
            'facility.f_type as facilityType',
            'facility.f_number as facilityNumber',
            'facility.f_capacity as facilityCapacity'
            )
        .join('user as user', 'reservation.r_user', 'user.id')
        .join('facility as facility', 'reservation.r_facility', 'facility.id');
      } else {
        console.log('showing confirmed');
        reservations = await Reservation.query().where('r_approved', true).select(
            'reservation.*',
            'user.u_fname as userFname',
            'user.u_sname as userSname',
            'user.u_email as userEmail',
            'user.u_mobileNo as userMobile',
            'facility.f_name as facilityName',
            'facility.f_type as facilityType',
            'facility.f_number as facilityNumber',
            'facility.f_capacity as facilityCapacity'
        )
        .join('user as user', 'reservation.r_user', 'user.id')
        .join('facility as facility', 'reservation.r_facility', 'facility.id');
      }
      console.log('reservations fetched', reservations);
      if (!reservations || reservations.length < 1) return {success: true, data: []};
      return {success: true, data: exports.mapReservations(reservations)}
    }catch (error){
      console.log('error fetching all reservations', error);
      return {success: false, msg: 'error fetching all reservations', error}
    }
  },
  flagUserReservations (userId, reservations) {
    reservations.data = reservations.data.map(reservation => exports.flagUserReservation(userId, reservation));
    return reservations;
  },
  flagUserReservation (userId, reservation) {
    return Object.assign({isMyReservation:reservation.user.id === userId}, reservation);
  },
  mapReservations (reservations) {
    return reservations.map(reservation => exports.mapReservation(reservation))
  },
  mapReservation (reservation) {
    console.log('mapping reservation', reservation);
    const reservationUser = {
      id: reservation.r_user,
      name: exports.titleCaseArray([reservation.userFname, reservation.userSname]).join(' '),
      email: reservation.userEmail,
      mobile: reservation.userMobile
    };
    const reservationFacility = {
      id: reservation.r_facility,
      name: exports.titleCaseString(reservation.facilityName),
      type: exports.titleCaseString(reservation.facilityType),
      number: reservation.facilityNumber,
      capacity: reservation.facilityCapacity
    };
    return {
      id: reservation.id,
      title: exports.titleCaseString(reservation.r_title),
      description: exports.titleCaseString(reservation.r_description),
      approved: !!reservation.r_approved,
      startDate: reservation.r_date,
      endDate: moment(reservation.r_date).add(reservation.r_duration, 'days').format('YYYY-MM-DD'),
      duration: reservation.r_duration,
      user: reservationUser,
      facility: reservationFacility
    }
  },
  async createFacility (details) {
    console.log('attempting to create new facility with ', details);
    try {
      const prevHighest = await exports.fetchHighestFacilityOfType(details.f_type);
      if(!prevHighest.success) return prevHighest;
      console.log('prev highest', prevHighest);
      if(prevHighest.data.length < 1){
        details.f_number = 1;
      }else{
        details.f_number = prevHighest.data[0].f_number + 1;
      }
      const facility = await Facility.query().insert(details);
      return {success: true, data: facility}
    } catch (e) {
      console.log('error occurred while saving facility', e);
      return {success: false, error: e}
    }
  },
  async fetchReservationDatesForFacility (facilityId) {
    const result = await exports.fetchReservationsForFacility(facilityId);
    if (!result.success) return result;
    if(result.data.length < 0) return {success: true, data: []};
    let responseData = [];
    result.data.forEach(reservation => {
      console.log('fetching reserved dates for', reservation);
      const currentDates = [reservation.r_date];
      if(reservation.r_duration > 1){
        console.log('reservation is for greater than one day');
        const startDate = moment(reservation.r_date);
        for(let i = 1; i < reservation.r_duration; i++){
          console.log('adding', i, 'days to', startDate.format('YYYY-MM-DD'));
          const tmpDate = startDate.clone(); // moment is mutable so must clone before modifying
          const nextDate = tmpDate.add(i, 'days').format('YYYY-MM-DD');
          currentDates.push(nextDate);
        }
      }
      responseData = responseData.concat(currentDates);
    });
    console.log('list of dates:', responseData);
    return {success: true, data: responseData}
  },
  async fetchReservationsForFacility (facilityId) {
    console.log('attempting to fetch reservations for facility', facilityId);
    try {
      const reservations = await Reservation.query().where('r_facility', facilityId);
      console.log('reservations fetched', reservations);
      return {success: true, data: reservations};
    }catch(error){
      console.log('error fetching reservations', error);
      return {success: false, error};
    }
  },
  async fetchHighestFacilityOfType (type) {
    console.log('attempting to fetch highest facility of type', type);
    try {
      const facility = await Facility.query().where('f_type', type).orderBy('f_number', 'desc').limit(1);
      console.log('facility fetched', facility);
      return {success: true, data: facility}
    } catch (error){
      console.log('error fetching the highest level facility', error);
      return { success: false, error }
    }
  },
  mapFacilities (facilities) {
    return facilities.map(facility => exports.mapFacility(facility));
  },
  mapFacility (facility) {
    console.log('attempting to map facility', facility);
    return {
      name: exports.titleCaseString(facility.f_name),
      id: facility.id,
      capacity: facility.f_capacity,
      number: facility.f_number,
      type: exports.titleCaseString(facility.f_type),
      approved: !!facility.f_approved
    }
  },
  async fetchConfirmedFacilities () {
    console.log('attempting to fetch confirmed facilities');
    try {
      const facilities = await Facility.query().where('f_approved', true);
      console.log('facilities fetched', facilities);
      return {success: true, data: exports.mapFacilities(facilities)}
    }catch(e){
      console.log('error fetching facilities', e);
      return {success: false, data: {}, error: e}
    }
  },

  async fetchFacilities () {
    console.log('attempting to fetch facilities details');
    try {
      const facilities = await Facility.query();
      console.log('facilities fetched', facilities);
      const mappedFacilities = exports.mapFacilities(facilities);
      console.log('mapped facilities', mappedFacilities);
      return {success: true, data: mappedFacilities}
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
  titleCaseString (str) {
    return exports.titleCaseArray(str.split(' ')).join(' ');
  },
  titleCaseArray (ary) {
    return ary.map(elem => `${elem[0].toUpperCase()}${elem.substring(1).toLowerCase()}`)
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
  async updateSingleUserProp (id, prop, value) {
    console.log('setting', prop, 'to', value, 'on', id);
    const mappedProp = exports.mapUserProp(prop);
    if(!mappedProp) return {success: false, msg: 'property is not valid'};
    console.log('property value is valid');
    try {
      const user = await User.query().patchAndFetchById(id, {[mappedProp]: value});
      console.log('update has completed');
      if(!user) return {success: false, data: {}, msg: 'user not found'};
      console.log('user exists');
      return {success: true, data: user}
    } catch (error) {
      console.log('error updating  user', error);
      return { success: false, error, msg: 'an error occurred while updating user' }
    }
  },
  mapUserProp (prop) {
    console.log('mapping user prop', prop);
    switch(prop){
    case 'fname':
      return 'u_fname';
    case 'sname':
      return 'u_sname';
    case 'mobile':
      return 'u_mobileNo';
    case 'email':
      return 'u_email';
    case 'password':
      return 'u_password';
    default:
      return false;
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
  async deleteUser(id){
    console.log('deleting user with id', id);
    try{
      const result = await User.query().delete().where('id', id);
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
  u_admin: details.admin || true,
  u_adminConfirmed: details.adminConfirmed || false,
  u_mobileNo: details.mobile,
  u_password:details.password,
  u_email: details.email
});

const getOutwardUsers = users => users.map(getOutwardUser);

const getOutwardUser = details => ({
  id: details.id,
  firstName: `${details.u_fname[0].toUpperCase()}${details.u_fname.substring(1).toLowerCase()}`,
  surname: `${details.u_sname[0].toUpperCase()}${details.u_sname.substring(1).toLowerCase()}`,
  name: `${details.u_sname}, ${details.u_fname}`,
  admin: !!details.u_admin && !!details.u_adminConfirmed,
  role: details.u_role,
  mobile: details.u_mobileNo,
  email: details.u_email
});
