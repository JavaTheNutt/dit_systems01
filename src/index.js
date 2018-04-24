require('dotenv').config();
const app = require('express')();
const basic = require('basic-auth');
const cors = require('cors');
const bodyParser = require('body-parser');
const userService = require('./service/userService');
const User = require('./models/User');
app.use(bodyParser.json());

app.use(cors());

const server = app.listen(process.env.PORT | 3000, () => {
  console.log(`server started at ${server.address().address} on port ${server.address().port}`);
});

app.post('/user/new', async (req, res, next) => {
  const result = await userService.createNewUser(req.body);
  res.status(result.success ? 200 : 500).send(result.success ? { user: {
    email: result.data.u_email,
    id: result.data.id,
    admin: !!(result.data.u_admin && result.data.u_adminConfirmed),
    name: '',
  }}: { msg: 'user creation failed'});
});

const customAuth = async (username, password) => {
  if(!username || !password){
    console.log('username or password does not exist');
    return {success: false, msg: 'username or password does not exist'}
  }
  console.log('fetched username', username);
  try{
    const user = await User.query().first().where({ u_email: username});
    if(!user) {
      console.log('username fetch yielded no results');
      return {success: false, msg: 'username fetch yielded no results'}
    }
    console.log('user record fetched, attempting to perform validation', user);
    console.log('password to be verfied:', password);
    const verifyResult = await user.verifyPassword(password);
    console.log('verify result:', verifyResult);
    if (!verifyResult) return false;
    return {
      success: true,
      data: {
        email: username,
        id: user.id,
        admin: !!(user.u_admin && user.u_adminConfirmed),
        name: user.u_fname && user.u_sname ? `${user.u_fname[0].toUpperCase()}${user.u_fname.substring(1).toLowerCase()} ${user.u_sname[0].toUpperCase()}${user.u_sname.substring(1).toLowerCase()}` : '',
        mobile: user.u_mobileNo
      }};
  }catch(e){
    console.log('error authenticating user', e);
    return {success: false, error:e, msg: 'an error occurred while authenticating user'};
  }
};
 app.use(async (req, res, next) => {
   const parsedAuth = basic(req);
   console.log('extracted', parsedAuth.name, 'and', parsedAuth.pass, 'from auth header');
   if(!parsedAuth){
     console.log('authorisation failed');
     return res.status(401).send({msg: 'authorisation header is invalid', details: 'please ensure that you have an' +
       ' Authorization header which adheres to RFC-7617'})
   }
   console.log('Authorization header parsed, attempting validation');
   const authResult = await customAuth(parsedAuth.name, parsedAuth.pass);
   console.log('auth result fetched');
   if(!authResult.success){
     console.log('auth was unsuccessful');
     console.log(authResult.msg);
     return res.status(401).send({msg: 'authentication failed'})
   }
   console.log('auth result was successful, appending', authResult.data, 'to request');
   req.auth = authResult.data;
   next();
 });
 const adminCheck = (req, res, next) => {
   console.log('request made to a protected resource, checking admin status');
   if(!req.auth.admin) return res.status(401).send({msg: 'you must be an admin to add a facility'});
   console.log('user is admin');
   next();
 };
 app.put('/user/initial', async (req, res, next) => {
   console.log('initial user data recieved for', req.auth.id);
   const result = await userService.updateUser(req.auth.id, req.body);
   res.status(result.success ? 200: 500).send(result);
 });
 app.put('/user/single', async (req, res, next) => {
   if(!req.body || !req.body.prop) return res.status(400).send({msg: 'a prop to update must be specified'});
   console.log('attempting to update', req.body.prop, 'property on user', req.auth.email);
   const result = await userService.updateSingleUserProp(req.auth.id, req.body.prop, req.body.value);
   console.log('result', result);
   sendResponse(res, result);
 });
 app.get('/user/login', async (req, res, next) => {
  console.log('user is assumed valid, since it passed the auth check, auth details:', req.auth);
  const data = {
    user: req.auth
  };
  if(req.auth.admin){
    console.log('user is admin, returning admin details');
    const adminRequests = await userService.getAdminRequests();
    data.adminRequests = adminRequests;
    console.log('admin requests:', adminRequests);
  }
  console.log('user data to be sent:', data.user);
  return res.status(200).send(data);
 });
 app.post('/facility', async (req, res, next) => {
  console.log('request made add a facility');
  req.body.f_approved = req.auth.admin;
  const details = {
    f_approved: req.auth.admin,
    f_name: req.body.name,
    f_type: req.body.type,
    f_capacity: req.body.capacity
  };
  const result = await userService.createFacility(details);
  const data = {};
  if(result.success && result.data){
    data.id = result.data.id;
    data.name = result.data.f_name;
    data.approved = result.data.f_approved;
    data.type = result.data.f_type;
    data.capacity = result.data.f_capacity;
    data.number = result.data.f_number;
  }
   res.status(result.success ? 200 : 500).send(data);
 });
 app.put('/facility/:id/confirm', adminCheck, async (req, res, next) => {
  console.log('request made to confirm a facility');
  const result = await userService.confirmFacilityRequest(req.params.id);
  sendResponse(res, result);
 });
 app.delete('/facility/:id', adminCheck, async (req, res, next) => {
   console.log('request made to delete facility', req.params.id);
   const result = await userService.deleteFacility(req.params.id);
   sendResponse(res, result);
 });
app.put('/facility/:id/reject', adminCheck, async (req, res, next) => {
  console.log('request made to reject a facility');
  const result = await userService.rejectFacilityRequest(req.params.id);
  sendResponse(res, result);
});
app.get('/facility/:id/dates', async (req, res, next) => {
  console.log('request made to fetch booked dates for facility', req.params.id);
  const result = await userService.fetchReservationDatesForFacility(req.params.id);
  sendResponse(res, result);
});
app.post('/reservation', async (req, res, next) => {
  console.log('request recieved to create reservation from', req.body);
  req.body.approved = req.auth.admin;
  req.body.user = req.auth.id;
  const result = await userService.createReservation(req.body);
  sendResponse(res, result);
});
app.delete('/reservation/:id', async (req, res, next) => {
  console.log('request recieved to delete reservation with ID', req.params.id);
  const result = await userService.deleteReservation(req.params.id);
  sendResponse(res, result);
});
app.get('/reservation', async (req, res, next) => {
  console.log('request made to fetch all reservations');
  const result = await userService.fetchAllReservations(req.auth.admin);
  console.log('fetched result', result);
  let flaggedResult;
  if(result.success) flaggedResult = userService.flagUserReservations(req.auth.id, result);
  sendResponse(res, flaggedResult || result);
});
app.put('/reservation/approve/:id', adminCheck, async (req, res, next) => {
  console.log('attempting to approve reservation with id', req.params.id);
  const result = await userService.approveReservation(req.params.id);
  sendResponse(res, result);
});
app.put('/reservation/update/facility/:id', async (req, res, next) => {
  console.log('attempting to set reservation', req.params.id,' to facility', req.body.facility);
  sendResponse(res, await userService.updateReservationFacility(req.params.id, req.body.facility))
});
app.put('/reservation/update/duration/:id', async (req, res, next) => {
  console.log('attempting to set reservation', req.params.id,' to facility', req.body.duration);
  sendResponse(res, await userService.updateReservationDuration(req.params.id, req.body.duration))
});
app.get('/facility/short', async (req, res, next) => {
  const result = await userService.fetchShortFacilities();
  sendResponse(res, result);
});
 app.get('/facility/:id', async (req, res, next) => {
    console.log('request recieved to fetch single facility');
    const result = await userService.fetchFacilityById(req.params.id);
   const wasSuccessful = result.success || false;
   res.status(wasSuccessful ? 200 : 500).send({
     msg: wasSuccessful ?
         'facility fectched successfully':
         'facility fetch failed',
     data: result.data
   });
 });
 app.put('/facility/:id', adminCheck, async (req, res, next) => {
   const result = await userService.updateFacility(req.params.id, {name: req.body.name});
   const wasSuccessful = result.success || false;
   res.status(wasSuccessful ? 200 : 500).send({
     msg: wasSuccessful ?
         'facilities updated successfully':
         'facility update failed',
     data: result.data
   });
 });

 app.get('/facility', async (req, res, next) => {
   console.log('request recieved to fetch all facilities');
   const result = req.auth.admin ?  await userService.fetchFacilities() : await userService.fetchConfirmedFacilities();
   const wasSuccessful = result.success || false;
   res.status(wasSuccessful ? 200 : 500).send({
     msg: wasSuccessful ?
         'facilities fectched successfully':
         'facility fetch failed',
     data: result.data
   });
 });
 app.put('/user/requestAdminStatus', async (req, res, next) => {
   console.log('user ', req.auth.user, 'requesting admin status');
   const result  = await userService.requestAdminStatus(req.auth.userId);
   const wasSuccessful = result.success;
   res.status(wasSuccessful ? 200 : 500).send({
     msg: wasSuccessful ?
         'user successfully requested admin status':
         result.msg,
     data: result.data
   });
 });
 app.get('/users', adminCheck, async (req, res, next) => {
   console.log('request made to fetch all users');
   const result = await userService.fetchUsers();
   sendResponse(res, result);
 });
 app.get('/user/getAdminRequests', adminCheck, async (req, res, next) => {
   console.log('request recieved to fetch pending admin requests');
   const result = await userService.getAdminRequests();
   sendResponse(res, result);
 });
app.put('/user/:id/setAdmin', adminCheck, async (req, res, next) => {
  console.log('request recieved to set user', req.params.id, 'as admin');
  const result = await userService.setUserAsAdmin(req.params.id);
  const wasSuccessful = result.success || false;
  res.status(wasSuccessful ? 200 : 500).send({
    msg: wasSuccessful ?
        'user successfully set as admin':
        'setting user as admin failed',
    data: result.data
  });
});
app.put('/user/:id/refuseAdminRequest', adminCheck, async (req, res, next) => {
  console.log('request recieved to refuse user', req.params.id, 'admin rights');
  const result = await userService.refuseAdminRequest(req.params.id);
  sendResponse(res, result);
});
app.delete('/user/:id', adminCheck, async (req, res, next) => {
  console.log('attempting to delete user with id', req.params.id);
  const result = await userService.deleteUser(req.params.id);
  sendResponse(res, result);
});
const sendResponse = (res, result) => res.status(result.success ? 200 : 500).send(result.data);
 app.get('/test', (req, res, next) => {
   console.log('test passed');
   console.log('request auth', req.auth);
   res.status(200).send('passed');
 });
