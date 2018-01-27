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
  res.status(result.success ? 200 : 500).send({
    msg: result.success ?
        'user added successfully':
        'user addition failed'
  });
});

const customAuth = async (username, password) => {
  console.log('fetched username', username);
  try{
    const user = await User.query().first().where({ u_email: username});
    console.log('user record fetched, attempting to perform validation');
    console.log('password to be verfied:', password);
    const verifyResult = await user.verifyPassword(password);
    console.log('verify result:', verifyResult);
    return {
      success: true,
      data: {
        email: username,
        id: user.id,
        admin: !!(user.u_admin && user.u_adminConfirmed)
      }};
  }catch(e){
    console.log('error authenticating user', e);
    return {success: false, error:e, msg: 'an error occurred while authenticating user'};
  }
};
 app.use(async (req, res, next) => {
   const parsedAuth = basic(req);
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
   req.auth = authResult.data;
   next();
 });
 const adminCheck = (req, res, next) => {
   console.log('request made to a protected resource, checking admin status');

   if(!req.auth.admin) return res.status(401).send({msg: 'you must be an admin to add a facility'});
   console.log('user is admin');
   next();
 };
 app.get('/user/login', (req, res, next) => {
  console.log('user is assumed valid, since it passed the auth check');
  return res.status(200).send('login succeeded');
 });
 app.post('/facility', adminCheck, async (req, res, next) => {
  console.log('request made add a facility');
  const result = await userService.createFacility(req.body);
   res.status(result.success ? 200 : 500).send({
     msg: result.success ?
         'facility added successfully':
         'facility addition failed'
   });
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
   const result = await userService.fetchFacilities();
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

 app.get('/test', (req, res, next) => {
   console.log('test passed');
   console.log('request auth', req.auth);
   res.status(200).send('passed');
 });
