const User = require('./src/models/User');
const Facility = require('./src/models/Facility');

let user01;
let user02;
let user03;
let user04;
let user05;
let user06;
let facility01;
let facility02;
let facility03;
let facility04;
let facility05;
let facility06;
(async()=> {
  try{

    user01 = await User.query().insert({
      u_fname: 'joe',
      u_sname: 'bloggs',
      u_role: 'manager',
      u_mobileNo: '0851111111',
      u_admin: true,
      u_adminConfirmed: true,
      u_password: 'pa$$w0rd',
      u_email: 'joe.bloggs@test.com'
    });
    user02 = await User.query().insert({
      u_fname: 'john',
      u_sname: 'bloggs',
      u_role: 'parent',
      u_mobileNo: '0852222222',
      u_admin: false,
      u_password: 'pa$$w0rd',
      u_email: 'john.bloggs@test.com'
    });
    user03 = await User.query().insert({
      u_fname: 'james',
      u_sname: 'bloggs',
      u_role: 'parent',
      u_mobileNo: '0853333333',
      u_admin: true,
      u_password: 'pa$$w0rd',
      u_email: 'james.bloggs@test.com'
    });
    user04 = await User.query().insert({
      u_fname: 'jane',
      u_sname: 'bloggs',
      u_role: 'manager',
      u_mobileNo: '0854444444',
      u_admin: true,
      u_adminConfirmed: false,
      u_password: 'pa$$w0rd',
      u_email: 'jane.bloggs@test.com'
    });
    user05 = await User.query().insert({
      u_fname: 'janine',
      u_sname: 'bloggs',
      u_role: 'parent',
      u_mobileNo: '0855555555',
      u_admin: true,
      u_adminConfirmed: false,
      u_password: 'pa$$w0rd',
      u_email: 'janine.bloggs@test.com'
    });
    user06 = await User.query().insert({
      u_fname: 'julie',
      u_sname: 'bloggs',
      u_role: 'parent',
      u_mobileNo: '0856666666',
      u_admin: true,
      u_password: 'pa$$w0rd',
      u_email: 'julie.bloggs@test.com'
    });
    facility01 = await Facility.query().insert({
      f_name: 'pitch 01',
      f_approved: false
    });
    facility02 = await Facility.query().insert({
      f_name: 'meeting room 01',
      f_approved: false
    });
    facility03 = await Facility.query().insert({
      f_name: 'pitch 02',
      f_approved: false
    });
    facility06 = await Facility.query().insert({
      f_name: 'meeting room 02',
      f_approved: false
    });
    facility04 = await Facility.query().insert({
      f_name: 'pitch 03',
      f_approved: false
    });
    facility05 = await Facility.query().insert({
      f_name: 'meeting room 03',
      f_approved: false
    });
    end();
  }catch (error) {
    console.log('error occurred populating the db', error);
    end(1);
  }
})();

const end = (code = 0) => process.exit(code);
