const express = require('express');
const { sequelize } = require('./models')
const app = express();
const bodyparser = require("body-parser");
const path = require('path');
const { User } = require('./models');
const crypto = require('crypto');
//const passport = require('passport');
const port = process.env.PORT || 3000;
const cors = require('cors');
const multer = require('multer');
const sendMail = require('./mailService');

const storage = multer.diskStorage(
  {
    destination: './images',
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  }
)
const upload = multer({ storage })


require('dotenv/config');

// **************************************** CORS ****************************************
var allowedDomains = ['http://localhost:4200', 'http://145.223.103.252', 'https://storiom.com'];

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



app.post('/api/uploadFile', upload.single('file'), (req, res) => {
  res.json({ success: true, message: "File uploaded" })
})

app.post('/api/sendMail', async (req, res) => {
  try {
    await sendMail(
      'ihebferjani04@gmail.com',
      'New user message',
      `<p>Message: ${req.body.message}</p>`
    );
    res.send('Email sent');
  } catch (err) {
    res.status(500).send('Email failed');
  }
})

app.get('/confirm', async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    where: {
      confirmationToken: token
    }
  });

  if (!user) {
    return res.status(400).send("Lien invalide.");
  }

  if (user.isConfirmed) {
    return res.status(200).send("Votre compte est déjà confirmé.");
  }

  if (user.tokenExpiresAt > new Date()) {
    user.isConfirmed = true;
    user.confirmationToken = null;
    user.tokenExpiresAt = null;
    await user.save();
    return res.send("Votre compte a été confirmé avec succès. Vous pouvez maintenant vous connecter.");
  }

  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  user.confirmationToken = newToken;
  user.tokenExpiresAt = newExpiry;
  await user.save();

  const confirmUrl = `https://storiom.com/confirm?token=${newToken}`;
  await sendMail(user.email, 'Nouveau lien de confirmation', `
    <h2>Votre lien a expiré</h2>
    <p>Voici un nouveau lien pour confirmer votre compte :</p>
    <a href="${confirmUrl}">Confirmer mon compte</a>
    <p>Ce lien est valable pendant 24 heures.</p>
  `);

  return res.status(200).send("Le lien a expiré. Un nouveau lien de confirmation vous a été envoyé par e-mail.");
});

app.post('/api/uploadMultipleFiles', upload.array('file'), (req, res) => {
  res.json({ success: true, message: "Files uploaded" })
})

const usersRoute = require('./routes/users');
const storesRoute = require('./routes/stores');
const categoriesRoute = require('./routes/categories');
const brandsRoute = require('./routes/brands');
const productsRoute = require('./routes/products');
const suppliersRoute = require('./routes/suppliers');
const creditsRoute = require('./routes/credits');
const expensesRoute = require('./routes/expenses');
const receiptsRoute = require('./routes/receipts');
const statsRoute = require('./routes/stats');
const workersRoute = require('./routes/workers');

app.use('/api/receipts', receiptsRoute)
app.use('/api/credits', creditsRoute)
app.use('/api/expenses', expensesRoute)
app.use('/api/suppliers', suppliersRoute)
app.use('/api/products', productsRoute)
app.use('/api/categories', categoriesRoute)
app.use('/api/brands', brandsRoute)
app.use('/api/stores', storesRoute)
app.use('/api/users', usersRoute)
app.use('/api/stats', statsRoute)
app.use('/api/workers', workersRoute)

//require('./config/passport')(passport);

app.use('/', (req, res) => {
  res.json({ message: "Welcome to the stock management application's backend!" });
})

app.listen(port, '0.0.0.0', async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected To Database')
  } catch (err) {
    console.log(err)
  }
});