require('dotenv').config();
const app = require('express')();
const basic = require('express-basic-auth');
const bodyParser = require('body-parser');
const userService = require('./service/userService');
const User = require('./models/User');
app.use(bodyParser.json());


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

const customAuth = async (username, password, cb) => {
  console.log('fetched username', username);
  try{
    const user = await User.query().first().where({ u_email: username});
    return cb(null, await user.verifyPassword(password));
  }catch(e){
    console.log('error authenticating user', e);
    return cb(null, false)
  }
};

 app.use(basic( {authorizer: customAuth, authorizeAsync: true}));
 app.use(async (req, res, next) => {
   console.log('auth challege succeeded, adding admin status to request');
   try {
     const user = await User.query().first().where({ u_email: req.auth.user});
     console.log('user fetched', user);
     console.log('is user admin?', !!(user.u_admin && user.u_adminConfirmed))
     req.auth.admin = !!(user.u_admin && user.u_adminConfirmed);
     next();
   } catch(e){
     console.log('error adding admin status to request');
     next(new Error('error adding admin status to request'));
   }
 });
 const adminCheck = (req, res, next) => {
   console.log('request made to a protected resource, checking admin status');
   
   if(!req.auth.admin) return res.status(401).send({msg: 'you must be an admin to add a facility'});
   console.log('user is admin');
   next();
 };
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
 app.get('/test', (req, res, next) => {
   console.log('test passed');
   console.log('request auth', req.auth);
   res.status(200).send('passed');
 });
