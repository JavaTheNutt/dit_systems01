require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const userService = require('./service/userService');

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
