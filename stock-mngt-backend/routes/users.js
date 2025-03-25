const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Subscription, Address, RefreshToken, Note } = require('../models');
const utility = require('../utility');
const checkSubscription = require('../checkSubscription');
const Sequelize = require('sequelize');
const subscription = require('../models/subscription');
const Op = Sequelize.Op;

//Register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, phone, country, street, city, state, postalCode, language, entryDate, salary, functionInStore, worksInStore, superiorId, role } = req.body
    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (user) res.json({ success: false, errorType: "EMAIL_FOUND", message: 'The email is already being used' })
        else {
            bcrypt.genSalt(10, async (err, salt) => {
                if (err) res.json(err);
                bcrypt.hash(password, salt, async (err, hash) => {
                    if (err) res.json(err);
                    try {
                        const createdUser = await User.create({ firstName, lastName, email, password, phone, language, password: hash, entryDate, salary, functionInStore, worksInStore, superiorId, role: "Admin" })
                        const createdAddress = await Address.create({ userId: createdUser.id, country, street, city, state, postalCode })
                        const createdSubscription = await Subscription.create({ userId: createdUser.id, duration: 'TRIAL' })
                        const token = utility.generateAccessToken(createdUser.toJSON());
                        const refreshToken = await utility.generateRefreshToken(createdUser.toJSON())
                        res.json({
                            success: true,
                            accessToken: token,
                            refreshToken
                        })
                    } catch (err) {
                        res.status(500).json({
                            success: false,
                            message: err.toString()
                        })
                    }
                })
            })
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.toString()
        })
    }
})


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
                }, include: ['store','subscription']
            });
            const accessToken = utility.generateAccessToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null, role: user.role, subscription: user.subscription })
            return res.json({ accessToken })
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

function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}





module.exports = router;