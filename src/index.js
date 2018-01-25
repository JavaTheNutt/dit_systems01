require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const User = require('./models/User');

app.use(bodyParser.json());


const server = app.listen(process.env.PORT | 3000, () => {
  console.log(`server started at ${server.address().address} on port ${server.address().port}`);
});

app.post('/user/new',async (req, res, next) => {
  console.log('post recieved to create new user');
  console.log('userDetails: ', req.body);
  try {
    await User.forge({
      u_fname: req.body.fname,
      u_sname: req.body.sname,
      u_role: req.body.role,
      u_mobileNo: req.body.mobile,
      u_admin: req.body.admin,
      u_password: req.body.password
    }).save();
    return res.status(200).json({msg: 'request recieved'})
  } catch (e){
    return res.status(500).json({msg: 'an error has occurred'})
  }


});
