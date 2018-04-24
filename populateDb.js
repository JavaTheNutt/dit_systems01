const User = require('./src/models/User');
const Facility = require('./src/models/Facility');
const Reservation = require('./src/models/Reservation');

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
      u_fname: 'mike',
      u_sname: 'murphy',
      u_role: 'parent',
      u_mobileNo: '0852222222',
      u_admin: false,
      u_password: 'pa$$w0rd',
      u_email: 'john.bloggs@test.com'
    });
    user03 = await User.query().insert({
      u_fname: 'paul',
      u_sname: 'murphy',
      u_role: 'parent',
      u_mobileNo: '0853333333',
      u_admin: true,
      u_password: 'pa$$w0rd',
      u_email: 'james.bloggs@test.com'
    });
    user04 = await User.query().insert({
      u_fname: 'mick',
      u_sname: 'murphy',
      u_role: 'manager',
      u_mobileNo: '0894444444',
      u_admin: true,
      u_adminConfirmed: false,
      u_password: 'pa$$w0rd',
      u_email: 'jane.bloggs@test.com'
    });
    user05 = await User.query().insert({
      u_fname: 'peter',
      u_sname: 'prewett',
      u_role: 'parent',
      u_mobileNo: '0875555555',
      u_admin: true,
      u_adminConfirmed: false,
      u_password: 'pa$$w0rd',
      u_email: 'janine.bloggs@test.com'
    });
    user06 = await User.query().insert({
      u_fname: 'micheal',
      u_sname: 'bloggs',
      u_role: 'parent',
      u_mobileNo: '0866666666',
      u_admin: true,
      u_password: 'pa$$w0rd',
      u_email: 'julie.bloggs@test.com'
    });
    facility01 = await Facility.query().insert({
      f_name: 'front pitch',
      f_approved: false,
      f_type: 'pitch',
      f_capacity: 100,
      f_number: 1
    });
    facility02 = await Facility.query().insert({
      f_name: 'kilkenny',
      f_approved: false,
      f_type: 'meeting room',
      f_capacity: 30,
      f_number: 1
    });
    facility03 = await Facility.query().insert({
      f_name: 'senior pitch',
      f_approved: false,
      f_type: 'pitch',
      f_capacity: 100,
      f_number: 2
    });
    facility06 = await Facility.query().insert({
      f_name: 'waterford',
      f_approved: true,
      f_type: 'meeting room',
      f_capacity: 30,
      f_number: 2
    });
    facility04 = await Facility.query().insert({
      f_name: 'back pitch',
      f_approved: true,
      f_type: 'pitch',
      f_capacity: 100,
      f_number: 3
    });
    facility05 = await Facility.query().insert({
      f_name: 'cork',
      f_approved: true,
      f_type: 'meeting room',
      f_capacity: 30,
      f_number: 3
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-12 training',
      r_user: user01.id,
      r_facility: facility04.id,
      r_date: '2018-04-25',
      r_duration: 1,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-13 training',
      r_user: user02.id,
      r_facility: facility04.id,
      r_date: '2018-03-25',
      r_duration: 3,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-14 training',
      r_user: user02.id,
      r_facility: facility04.id,
      r_date: '2018-05-25',
      r_duration: 10,
      r_approved: false
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-12 training',
      r_user: user01.id,
      r_facility: facility04.id,
      r_date: '2018-09-25',
      r_duration: 1,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-13 training',
      r_user: user02.id,
      r_facility: facility04.id,
      r_date: '2017-06-25',
      r_duration: 3,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'training',
      r_description: 'u-14 training',
      r_user: user02.id,
      r_facility: facility04.id,
      r_date: '2018-07-25',
      r_duration: 10,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'AGM',
      r_description: 'Soccer Club AGM',
      r_user: user02.id,
      r_facility: facility05.id,
      r_date: '2018-07-25',
      r_duration: 10,
      r_approved: true
    });
    await Reservation.query().insert({
      r_title: 'EGM',
      r_description: 'Hurling Club AGM',
      r_user: user02.id,
      r_facility: facility06.id,
      r_date: '2018-07-25',
      r_duration: 10,
      r_approved: true
    });
    end();
  }catch (error) {
    console.log('error occurred populating the db', error);
    end(1);
  }
})();

const end = (code = 0) => process.exit(code);
