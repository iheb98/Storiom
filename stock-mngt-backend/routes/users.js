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
const { accountConfirmationEmail } = require('.././emailTemplates');
const Op = Sequelize.Op;

//Register
router.post('/register', async (req, res) => {
    const {
        firstName, lastName, email, password, phone, country,
        street, city, state, postalCode, language, entryDate,
        salary, functionInStore, worksInStore, superiorId, role,
        referredBy
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
            superiorId,
            role: "Customer",
            referredBy,
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

        // Note: Subscription is created when user creates a store (not during registration)

        // Send confirmation email
        const confirmUrl = `https://storiom.com/confirm?token=${confirmationToken}`;
        const emailHtml = accountConfirmationEmail(firstName, confirmUrl);
        await sendMail(email, 'Bienvenue sur Storiom - Confirmez votre compte', emailHtml);

        res.json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.'
        });

    } catch (err) {
        console.log(err);
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
            return res.status(500).json({ message: 'Merci de confirmer votre compte. Un mail contenant le lien de vérification a été envoyé', isConfirmed: false });
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
        console.log(err);
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

router.get('/:id', utility.authenticate, (req, res, next) => {
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

router.put('/edit', utility.authenticate, (req, res, next) => {
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
            const { street, city, state, postalCode, country } = req.body.address;
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



router.get('/profile/:id', utility.authenticate, async (req, res, next) => {
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

// Get subscription details (full data)
router.get('/subscription/:id', utility.authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({
            where: { id },
            include: ['subscription']
        });

        if (!user || !user.subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        let { activationDate, expirationDate, duration, createdAt } = user.subscription;

        // Calculate expiration date if not set
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

        const isExpired = calculatedExpirationDate && new Date() > new Date(calculatedExpirationDate);

        res.json({
            success: true,
            subscription: {
                activationDate,
                expirationDate: calculatedExpirationDate,
                duration,
                isExpired,
                createdAt
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        });
    }
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
    const firstName = user.firstName || 'Utilisateur';

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe - Storiom</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f7fa; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                        
                        <!-- Header with gradient -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%); padding: 40px 40px 50px; text-align: center;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center">
                                            <!-- Logo/Brand -->
                                            <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 12px 24px; border-radius: 50px; margin-bottom: 25px;">
                                                <span style="color: #ffffff; font-size: 20px; font-weight: 600;">🔐 Storiom</span>
                                            </div>
                                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; line-height: 1.3;">
                                                Réinitialisation de mot de passe
                                            </h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Key Icon Circle -->
                        <tr>
                            <td align="center" style="padding: 0;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%); border-radius: 50%; margin-top: -40px; display: flex; align-items: center; justify-content: center; border: 5px solid #ffffff; box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);">
                                    <span style="font-size: 32px; line-height: 80px;">🔑</span>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 40px 40px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="text-align: center;">
                                            <h2 style="margin: 0 0 15px; color: #2c3e50; font-size: 22px; font-weight: 600;">
                                                Bonjour ${firstName} 👋
                                            </h2>
                                            <p style="margin: 0 0 25px; color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                                                Nous avons reçu une demande de réinitialisation de votre mot de passe. 
                                                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
                                            </p>
                                            
                                            <!-- CTA Button -->
                                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px auto;">
                                                <tr>
                                                    <td align="center" style="background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%); border-radius: 12px;">
                                                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 18px 45px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
                                                            🔓 Réinitialiser mon mot de passe
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Timer badge -->
                                            <div style="display: inline-block; background-color: #fff3e0; padding: 12px 20px; border-radius: 8px; margin-bottom: 25px;">
                                                <span style="color: #f57c00; font-size: 14px; font-weight: 500;">
                                                    ⏱️ Ce lien expire dans 1 heure
                                                </span>
                                            </div>
                                            
                                            <p style="margin: 0 0 20px; color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                                                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:
                                            </p>
                                            <p style="margin: 0 0 25px; background-color: #f5f7fa; padding: 15px; border-radius: 8px; word-break: break-all;">
                                                <a href="${resetUrl}" style="color: #3f51b5; font-size: 13px; text-decoration: none;">${resetUrl}</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Security Notice -->
                        <tr>
                            <td style="padding: 0 40px 30px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e8f5e9; border-radius: 12px; border-left: 4px solid #2e7d32;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <p style="margin: 0 0 8px; color: #2e7d32; font-size: 15px; font-weight: 600;">
                                                🛡️ Conseil de sécurité
                                            </p>
                                            <p style="margin: 0; color: #558b2f; font-size: 14px; line-height: 1.5;">
                                                Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. 
                                                Votre mot de passe restera inchangé.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e8ecef;">
                                <p style="margin: 0 0 10px; color: #7f8c8d; font-size: 14px;">
                                    Des questions ? Contactez notre support
                                </p>
                                <p style="margin: 0 0 20px;">
                                    <a href="mailto:support@storiom.com" style="color: #3f51b5; text-decoration: none; font-weight: 500;">support@storiom.com</a>
                                </p>
                                <p style="margin: 0; color: #bdc3c7; font-size: 12px;">
                                    © 2026 Storiom. Tous droits réservés.<br>
                                    Cet email a été envoyé à ${email}
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                    
                    <!-- Email Footer Text -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 20px;">
                        <tr>
                            <td align="center">
                                <p style="margin: 0; color: #95a5a6; font-size: 12px; line-height: 1.5;">
                                    Vous recevez cet email car une demande de réinitialisation de mot de passe 
                                    a été effectuée pour votre compte Storiom.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    await sendMail(email, 'Réinitialisation de votre mot de passe - Storiom', emailHtml);

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

// ========================================
// USER SETTINGS
// ========================================

/**
 * @route   GET /api/users/:id/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/:id/settings', utility.authenticate, async (req, res) => {
    try {
        const userId = req.params.id;

        // Ensure user can only access their own settings
        if (req.user.id != userId) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const user = await User.findByPk(userId, {
            attributes: ['settings']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Return default settings if none exist
        const defaultSettings = {
            theme: {
                primaryColor: '#3f51b5',
                mode: 'light'
            },
            defaults: {
                productVisibleToPublic: true,
                productToDisplay: true
            },
            navigation: {
                defaultScreen: 'dashboard'
            }
        };

        res.json({ success: true, settings: user.settings || defaultSettings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});

/**
 * @route   PUT /api/users/:id/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/:id/settings', utility.authenticate, async (req, res) => {
    try {
        const userId = req.params.id;

        // Ensure user can only update their own settings
        if (req.user.id != userId) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Merge new settings with existing settings
        const currentSettings = user.settings || {};
        const newSettings = req.body.settings || {};

        const mergedSettings = {
            theme: { ...currentSettings.theme, ...newSettings.theme },
            defaults: { ...currentSettings.defaults, ...newSettings.defaults },
            navigation: { ...currentSettings.navigation, ...newSettings.navigation }
        };

        user.settings = mergedSettings;
        await user.save();

        res.json({ success: true, settings: user.settings, message: 'Paramètres mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.toString() });
    }
});




module.exports = router;