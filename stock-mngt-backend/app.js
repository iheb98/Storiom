const express = require('express');
const { sequelize } = require('./models')
const app = express();
const bodyparser = require("body-parser");
const path = require('path');
//const passport = require('passport');
const port = process.env.PORT || 3000;
const cors = require('cors');
const multer = require('multer');
const storage = multer.diskStorage(
  {
    destination: './images',
    filename: function (req, file, cb) {
      cb(null, file.originalname )
    }
  }
)
const upload = multer({ storage })


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
app.use(bodyparser.json({ limit: '50mb' }));



app.post('/api/uploadFile', upload.single('file', (req, res) => {
  let filePath = ''
}))
const usersRoute = require('./routes/users');
const storesRoute = require('./routes/stores');
const categoriesRoute = require('./routes/categories');
const productsRoute = require('./routes/products');
const suppliersRoute = require('./routes/suppliers');
const creditsRoute = require('./routes/credits');
const receiptsRoute = require('./routes/receipts');

app.use('/api/receipts', receiptsRoute)
app.use('/api/credits', creditsRoute)
app.use('/api/suppliers', suppliersRoute)
app.use('/api/products', productsRoute)
app.use('/api/categories', categoriesRoute)
app.use('/api/stores', storesRoute)
app.use('/api/users', usersRoute)

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