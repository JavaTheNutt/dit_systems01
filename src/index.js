require('dotenv').config();
const app = require('express')();
const basic = require('express-basic-auth');
const bodyParser = require('body-parser');
const userService = require('./service/userService');
const User = require('./models/User');
const bcrypt = require('bcrypt');
app.use(bodyParser.json());


const server = app.listen(process.env.PORT | 3000, () => {
  console.log(`server started at ${server.address().address} on port ${server.address().port}`);
});

app.post('/user/new',async (req, res, next) => {
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
    const user = await new User('u_email', username).fetch();
    return cb(null, await bcrypt.compare(password, user.attributes.u_password));
  }catch(e){
    console.log('error authenticating user', e);
    return cb(null, false)
  }

};
 app.use(basic( {authorizer: customAuth, authorizeAsync: true}));

 app.get('/test', (req, res, next) => {
   console.log('test passed');
   res.status(200).send('passed');
 });
