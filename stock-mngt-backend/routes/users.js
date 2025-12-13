const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Subscription, Address, RefreshToken, Note } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const Sequelize = require('sequelize');
const subscription = require('../models/subscription');
const crypto = require('crypto');
const sendMail = require('.././mailService');
const Op = Sequelize.Op;

//Register
router.post('/register', async (req, res) => {
    const {
        firstName, lastName, email, password, phone, country,
        street, city, state, postalCode, language, entryDate,
        salary, functionInStore, worksInStore, superiorId, role
    } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.json({ success: false, errorType: "EMAIL_FOUND", message: 'The email is already being used' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const confirmationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        const createdUser = await User.create({
            firstName, lastName, email, phone, language,
            password: hashedPassword,
            entryDate, salary, functionInStore, worksInStore,
            superiorId, role: "Owner",
            confirmationToken,
            tokenExpiresAt,
            isConfirmed: false,
            termsAccepted: true,
            termsAcceptedAt: new Date()
        });

        await Address.create({
            userId: createdUser.id,
            country, street, city, state, postalCode
        });

        await Subscription.create({
            userId: createdUser.id,
            duration: 'TRIAL'
        });

        // Send confirmation email
        const confirmUrl = `https://storiom.com/confirm?token=${confirmationToken}`;
        await sendMail(email, 'Confirmer votre compte', `
        <h2>Bienvenue sur Storiom</h2>
        <p>Veuillez confirmer votre compte en cliquant sur le lien ci-dessous :</p>
        <a href="${confirmUrl}">Activer mon compte</a>

      `);

        res.json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.'
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
});


router.post('/authenticate', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({
            where: {
                email
            }, include: ['store', 'subscription']
        });
        if (!user) {
            return res.json({ success: false, errorType: "EMAIL_ERROR", error: "Utilisateur non trouvé" });
        }

        if (!user || !user.isConfirmed) {
            return res.status(500).json({ message: 'Merci de confirmer votre compte. Un mail contenant le lien de vérification a été envoyé' });
        }

        comparePassword(password, user.password, async (err, isMatch) => {
            if (err) res.json(err);
            if (isMatch) {
                const token = utility.generateAccessToken({ id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null, subscription: user.subscription });
                const refreshToken = await utility.generateRefreshToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null, subscription: user.subscription })
                // **************************************** LOCAL STORAGE **********************************
                res.json({
                    success: true,
                    accessToken: token,
                    refreshToken
                })
                //********************************************************
            } else {
                return res.json({ success: false, errorType: "PASSWORD_ERROR", error: 'Mot de passe incorrect !' });
            }
        })
    } catch (err) {
        res.json({ error: err })
    }
});

router.post('/notes/create', utility.authenticate, checkSubscription, (req, res) => {
    const { comment, images, userId } = req.body
    Note.create({ comment, images: JSON.stringify(images), userId }).then(createdNote => {
        res.json({
            note: createdNote
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
})

router.get('/:id/notes', utility.authenticate, checkSubscription, (req, res, next) => {
    const userId = req.params.id;
    Note.findAll({
        where: {
            userId
        }
    }).then(notes => {
        res.json(notes)

    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    User.findAll(utility.paginate({
        where: {
            worksInStore: id,
            ...utility.buildQuery(req.query.query),
            superiorId: req.user.id
        }
    }, { page: req.query.page, pageSize: req.query.size })).then(users => {
        res.json(users)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});



router.get('/count/store/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    User.count({
        where: {
            worksInStore: id,
            ...utility.buildQuery(req.query.query),
            superiorId: req.user.id
        }
    }).then(countUsers => {
        res.json(countUsers)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    User.findOne({
        where: {
            id,
            superiorId: req.user.id
        }
    }).then(user => {
        res.json(user)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.put('/edit', utility.authenticate, checkSubscription, (req, res, next) => {
    User.findOne({
        where: {
            [Op.and]: {
                id: req.body.id,
                id: req.user.id,
            }
        }
    }).then(user => {
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName
        user.phone = req.body.phone
        user.email = req.body.email
        user.salary = req.body.salary
        user.functionInStore = req.body.functionInStore
        user.entryDate = req.body.entryDate
        user.save().then(async savedUser => {
            // Update or Create Address if fields are present
            const { street, city, state, postalCode, country } = req.body;
            if (street || city || state || postalCode || country) {
                const addressData = { street, city, state, postalCode, country, userId: user.id };

                const existingAddress = await Address.findOne({ where: { userId: user.id } });
                if (existingAddress) {
                    await existingAddress.update(addressData);
                } else {
                    await Address.create(addressData);
                }
            }

            // Fetch fresh user data with address to return
            const freshUser = await User.findOne({
                where: { id: user.id },
                include: ['address', 'subscription']
            });

            res.json({ message: "User and address updated", success: true, user: freshUser });
        })
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.post('/token', async (req, res, next) => {
    const refreshToken = req.body.token
    if (refreshToken === null) return res.sendStatus(401)
    try {
        const foundToken = await RefreshToken.findOne({
            where: {
                value: refreshToken
            }
        })
        if (!foundToken) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.SECRET, async (err, tokenData) => {
            if (err) return res.sendStatus(403)
            const user = await User.findOne({
                where: {
                    id: tokenData.id
                }, include: ['store', 'subscription']
            });
            if (user) {
                const accessToken = utility.generateAccessToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null, role: user.role, subscription: user.subscription })
                return res.json({ accessToken })
            } else {
                return res.sendStatus(500)
            }
        })
    } catch (err) {
        return res.sendStatus(500)
    }

});


router.delete('/logout', async (req, res, next) => {
    //refreshTokens = refreshTokens.filter(token => token !== req.body.token)

    try {
        const foundToken = await RefreshToken.destroy({
            where: {
                value: req.body.token
            }
        })
        res.sendStatus(204)
    } catch (err) {
        return res.sendStatus(500)
    }

});

router.delete('/delete-user', async (req, res, next) => {

    try {
        const foundUser = await User.destroy({
            where: {
                email: req.body.email
            }
        })
        res.sendStatus(204)
    } catch (err) {
        return res.sendStatus(500)
    }

});

router.put('/makeAdmin', (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {

        user.role = req.body.role
        user.save().then(savedUser => {
            res.json({ message: "User updated", success: true })
        })
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.get('/', async (req, res, next) => {
    User.findAll({
        include: ['subscription']
    }).then(users => {
        res.json(users)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })

});



router.get('/profile/:id', utility.authenticate, checkSubscription, async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findOne({
            where: {
                id
            }, include: ['address', 'subscription']
        })
        res.json(user)
    } catch (err) {
        res.json(err)
    }
});


router.get('/checkSubscription/:id', utility.authenticate, checkSubscription, (req, res, next) => {
    const id = req.params.id;
    User.findOne({
        where: {
            id
        }, include: ['subscription']
    }).then(user => {
        let { activationDate, expirationDate, duration } = user.subscription;

        let isExpired = false;
        let calculatedExpirationDate = expirationDate;

        if (!expirationDate) {
            const durationMapping = {
                "TRIAL": 30,
                "1M": 30,
                "3M": 90,
                "6M": 180,
                "12M": 365
            };

            if (durationMapping[duration]) {
                calculatedExpirationDate = new Date(activationDate);
                calculatedExpirationDate.setDate(calculatedExpirationDate.getDate() + durationMapping[duration]);
            }
        }

        if (calculatedExpirationDate && new Date() > new Date(calculatedExpirationDate)) {
            isExpired = true;
        }

        res.json(isExpired)
    }).catch(err => {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    })
});

router.put('/extendSubscription/:id', async (req, res) => {
    const id = req.params.id;
    const { extensionDays } = req.body; // number of days to extend

    if (!extensionDays || isNaN(extensionDays)) {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing 'extensionDays'."
        });
    }

    try {
        const user = await User.findOne({
            where: { id },
            include: ['subscription']
        });

        if (!user || !user.subscription) {
            return res.status(404).json({
                success: false,
                message: "User or subscription not found."
            });
        }

        let { expirationDate } = user.subscription;

        let newExpirationDate;
        if (expirationDate) {
            newExpirationDate = new Date(expirationDate);
        } else {
            // If there is no expirationDate, use today as base
            newExpirationDate = new Date();
        }

        newExpirationDate.setDate(newExpirationDate.getDate() + parseInt(extensionDays));

        // Update the subscription
        await user.subscription.update({
            expirationDate: newExpirationDate
        });

        res.json({
            success: true,
            message: `Subscription extended by ${extensionDays} days.`,
            newExpirationDate
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
});


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send('No user with that email');
    if (!user.isConfirmed) return res.status(500).send('Merci de confirmer votre compte');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `https://storiom.com/reset-password/${token}`;
    await sendMail(email, 'Reset your password', `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link is valid for 1 hour.</p>
    `);

    res.json({ success: true, message: 'Email de réinitialisation envoyé.' });
});


router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { [Op.gt]: new Date() }
        }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
});



function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}





module.exports = router;