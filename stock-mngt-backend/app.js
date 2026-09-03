const express = require('express');
const { sequelize } = require('./models')
const app = express();
const ejs = require('ejs');

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, 'views'));
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
const { DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./config/r2');
const { domainResolver } = require('./domainResolver');

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
var allowedDomains = ['*', 'http://localhost:4200', 'http://161.97.186.60', 'https://storiom.com', 'https://www.storiom.com', 'http://192.168.0.194:4200'];

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

    // Always allow our known domains
    if (allowedDomains.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow any custom store domain (they'll be verified by the domain resolver)
    // Custom domains will have their own origin, so we allow them dynamically
    const { isPlatformDomain } = require('./domainResolver');
    const originHost = new URL(origin).hostname;
    if (!isPlatformDomain(originHost)) {
      // It's a custom domain — allow it (the domain resolver will validate it)
      return callback(null, true);
    }

    var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
    return callback(new Error(msg), false);
  }
}));
//**************************************************************************************************************

app.use(express.static('.'));
app.use('/views', express.static(require('path').join(__dirname, 'views')));
app.use(bodyparser.json({ limit: '50mb' }));

// Domain resolver — detect custom store domains from Host header
app.use(domainResolver);

// Set UTF-8 charset for all JSON responses (fixes French character encoding on VPS/Nginx)
app.use((req, res, next) => {
  res.charset = 'utf-8';
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    return originalJson(data);
  };
  next();
});


app.post('/api/uploadFile', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded",
    fileUrl: req.file.location, // Cloudflare R2 returns the full public URL
  });
});

app.post('/api/uploadMultipleFiles', upload.array('file', 20), (req, res) => {
  // `req.files` is an array of uploaded file info
  const uploadedFiles = req.files.map(file => ({
    originalname: file.originalname,
    location: file.location, // S3/R2 URL
    size: file.size, // File size in bytes
    key: file.key, // R2 key for deletion
  }));

  res.json({
    success: true,
    message: "Files uploaded successfully",
    files: uploadedFiles,
  });
});

// Delete file from R2
app.delete('/api/deleteFile', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is required' });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
    });

    await s3.send(command);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, message: 'Failed to delete file', error: error.message });
  }
});

// Get file info (size) from R2
app.get('/api/getFileInfo/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
    });

    const response = await s3.send(command);

    res.json({
      success: true,
      size: response.ContentLength,
      contentType: response.ContentType,
    });
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ success: false, message: 'Failed to get file info', error: error.message });
  }
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
  const utility = require('./utility');

  const user = await User.findOne({
    where: {
      confirmationToken: token
    },
    include: ['store', 'subscription']
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

    // Generate tokens for auto-login
    const accessToken = utility.generateAccessToken({
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      store: user.store ? user.store.id : null,
      subscription: user.subscription
    });
    const refreshToken = await utility.generateRefreshToken({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      store: user.store ? user.store.id : null,
      subscription: user.subscription
    });

    return res.send({
      message: "Votre compte a été confirmé avec succès !",
      success: true,
      accessToken,
      refreshToken
    });
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
const deliveryWorkersRoute = require('./routes/delivery-workers');
const storeServicesRoute = require('./routes/store-services');
const serviceRequestsRoute = require('./routes/service-requests');
const paymentOrdersRoute = require('./routes/payment-orders');
const analyticsRoute = require('./routes/analytics');
const wishlistRoute = require('./routes/wishlist');
const storeCustomersRoute = require('./routes/store-customers');
const notificationsRoute = require('./routes/notifications');
const promotionsRoute = require('./routes/promotions');
const ogTagsMiddleware = require('./ogTagsMiddleware');
const storefrontRouter = require('./routes/storefront');

// OG tags for social media crawlers (must be before API routes)
app.use('/og', ogTagsMiddleware);

// SSR store pages for custom domains (before API routes)
app.use((req, res, next) => {
    if (req.isCustomDomain && req.resolvedStore) {
        return storefrontRouter(req, res, next);
    }
    next();
});

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
app.use('/api/delivery-workers', deliveryWorkersRoute)
app.use('/api/store-services', storeServicesRoute)
app.use('/api/service-requests', serviceRequestsRoute)
app.use('/api/payment-orders', paymentOrdersRoute)
app.use('/api/analytics', analyticsRoute)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/store-customers', storeCustomersRoute)
app.use('/api/notifications', notificationsRoute)
app.use('/api/promotions', promotionsRoute)

//require('./config/passport')(passport);

// Health check endpoint — monitor cache, memory, and DB pool
app.get('/api/health', async (req, res) => {
  try {
    const { getStats } = require('./cacheService');
    const { getDomainCacheStats } = require('./domainResolver');

    // DB pool status
    let dbPool = {};
    try {
      const pool = sequelize.connectionManager.pool;
      dbPool = {
        size: pool.size,
        available: pool.available,
        pending: pool.pending,
        max: pool.max,
        min: pool.min
      };
    } catch (e) {
      dbPool = { error: 'Unable to read pool stats' };
    }

    // Memory usage
    const mem = process.memoryUsage();

    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()) + 's',
      memory: {
        rss: (mem.rss / 1024 / 1024).toFixed(1) + ' MB',
        heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(1) + ' MB',
        heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(1) + ' MB'
      },
      cache: getStats(),
      domainCache: getDomainCacheStats(),
      dbPool,
      pid: process.pid
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.toString() });
  }
});

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