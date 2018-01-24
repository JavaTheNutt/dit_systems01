require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const server = app.listen(process.env.PORT | 3000, () => {
  console.log(`server started at ${server.address().address} on port ${server.address().port}`);
});
