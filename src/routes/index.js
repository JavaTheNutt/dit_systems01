module.exports = server => {
  server.post('/user/new', (req, res, next) => {
    console.log('post recieved to create new user');
  });
};
