const express = require('express');
const { sequelize } = require('./models')
const app = express();
const bodyparser = require("body-parser");
const path = require('path');
//const passport = require('passport');
const port = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv/config');

// **************************************** CORS ****************************************
var allowedDomains = ['http://localhost:4200'];

/*
var corsOptions = {
  origin: 'https://djotech.herokuapp.com',
  optionsSuccessStatus: 200
}
*/

// CROSS ORIGIN RESOURCE SHARING
app.use(cors({
  origin: function (origin, callback) {
    // bypass the requests with no origin (like curl requests, mobile apps, etc )
    if (!origin) return callback(null, true);

    if (allowedDomains.indexOf(origin) === -1) {
      var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
//**************************************************************************************************************

app.use(express.static('.'));
app.use(bodyparser.json({limit: '50mb'}));

const usersRoute = require('./routes/users');
const storesRoute = require('./routes/stores');
const categoriesRoute = require('./routes/categories');
const productsRoute = require('./routes/products');
const suppliersRoute = require('./routes/suppliers');
const creditsRoute = require('./routes/credits');
const receiptsRoute = require('./routes/receipts');

app.use('/receipts', receiptsRoute)
app.use('/credits', creditsRoute)
app.use('/suppliers', suppliersRoute)
app.use('/products', productsRoute)
app.use('/categories', categoriesRoute)
app.use('/stores', storesRoute)
app.use('/users', usersRoute)

//require('./config/passport')(passport);

app.use('/', (req, res) => {
  res.json({ message: "Welcome to the stock management application's backend!" });
})

app.listen(port, async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected To Database')
  } catch (err) {
    console.log(err)
  }
});