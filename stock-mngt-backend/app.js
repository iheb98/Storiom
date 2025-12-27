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
const { expiredLinkEmail, resendConfirmationEmail } = require('./emailTemplates');
const multerS3 = require('multer-s3');
const s3 = require('./config/r2');

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.R2_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = Date.now() + '-' + file.originalname;
      cb(null, filename);
    },
  }),
});

const storage = multer.diskStorage(
  {
    destination: './images',
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  }
)
//const upload = multer({ storage })


require('dotenv/config');

// **************************************** CORS ****************************************
var allowedDomains = ['http://localhost:4200', 'http://145.223.103.252', 'https://storiom.com', 'https://www.storiom.com'];

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
  res.json({
    success: true,
    message: "File uploaded",
    fileUrl: req.file.location, // Cloudflare R2 returns the full public URL
  });
});

app.post('/api/uploadMultipleFiles', upload.array('file', 10), (req, res) => {
  // `req.files` is an array of uploaded file info
  const uploadedFiles = req.files.map(file => ({
    originalname: file.originalname,
    location: file.location, // S3/R2 URL
  }));

  res.json({
    success: true,
    message: "Files uploaded successfully",
    files: uploadedFiles,
  });
});


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

app.get('/api/confirm', async (req, res) => {
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
    return res.status(200).send({ message: "Votre compte est déjà confirmé." });
  }

  if (user.tokenExpiresAt > new Date()) {
    user.isConfirmed = true;
    user.confirmationToken = null;
    user.tokenExpiresAt = null;
    await user.save();
    return res.send({ message: "Votre compte a été confirmé avec succès. Vous pouvez maintenant vous connecter." });
  }

  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  user.confirmationToken = newToken;
  user.tokenExpiresAt = newExpiry;
  await user.save();

  const confirmUrl = `https://storiom.com/confirm?token=${newToken}`;
  const emailHtml = expiredLinkEmail(user.firstName || user.email, confirmUrl);
  await sendMail(user.email, 'Nouveau lien de confirmation - Storiom', emailHtml);

  return res.status(500).send("Le lien a expiré. Un nouveau lien de confirmation vous a été envoyé par e-mail.");
});

app.get('/api/resendConfirmationMail', async (req, res) => {
  const { email } = req.query;

  const user = await User.findOne({
    where: {
      email
    }
  });

  if (!user) {
    return res.status(400).send("Email invalide.");
  }

  if (user.isConfirmed) {
    return res.status(200).send({ message: "Votre compte est déjà confirmé." });
  }

  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  user.confirmationToken = newToken;
  user.tokenExpiresAt = newExpiry;
  await user.save();

  const confirmUrl = `https://storiom.com/confirm?token=${newToken}`;
  const emailHtml = resendConfirmationEmail(user.firstName || user.email, confirmUrl);
  await sendMail(user.email, 'Confirmez votre compte - Storiom', emailHtml);

  return res.status(200).send("Un nouveau lien de confirmation vous a été envoyé par e-mail.");
});



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
const publicRoutes = require('./routes/public');
const ordersRoute = require('./routes/orders');

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
app.use('/api/public', publicRoutes)
app.use('/api/orders', ordersRoute)

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