const User = require('./src/models/User');
const Facility = require('./src/models/Facility');

let user01;
let user02;
let facility01;
let facility02;
(async()=> {
  user01 = await new User({
    u_fname: 'joe',
    u_sname: 'bloggs',
    u_role: 'manager',
    u_mobileNo: '0851111111',
    u_admin: true,
    u_password: 'pa$$w0rd',
    u_email: 'joe.bloggs@test.com'
  }).save();
  user02 = await new User({
    u_fname: 'john',
    u_sname: 'bloggs',
    u_role: 'parent',
    u_mobileNo: '0852222222',
    u_admin: false,
    u_password: 'pa$$w0rd',
    u_email: 'john.bloggs@test.com'
  }).save();
  facility01 = await new Facility({
    f_name: 'pitch 01'
  }).save();
  facility02 = await new Facility({
    f_name: 'meeting room 01'
  }).save();
  end();
})();

const end = () => process.exit(0);
