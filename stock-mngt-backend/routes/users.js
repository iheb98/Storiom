const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Subscription, Address, RefreshToken, Note } = require('../models');
const utility = require('../utility');
const Sequelize = require('sequelize');
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
                    const createdUser = await User.create({ firstName, lastName, email, password, phone, language, password: hash, entryDate, salary, functionInStore, worksInStore, superiorId, role })
                    const createdAddress = await Address.create({ userId: createdUser.id, country, street, city, state, postalCode })
                    const createdSubscription = await Subscription.create({ userId: createdUser.id, duration: 'TRIAL' })
                    const token = utility.generateAccessToken(createdUser.toJSON());
                    const refreshToken = await utility.generateRefreshToken(createdUser.toJSON())
                    res.json({
                        success: true,
                        accessToken: token,
                        refreshToken
                    })
                })
            })
        }
    } catch (err) {
        res.status(500).json({
success:false,
message:err.toString()
})
    }
})


router.post('/authenticate', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({
            where: {
                email
            }, include: ['store']
        });
        if (!user) {
            return res.json({ success: false, errorType: "EMAIL_ERROR", error: "Utilisateur non trouvé" });
        }

        comparePassword(password, user.password, async (err, isMatch) => {
            if (err) res.json(err);
            if (isMatch) {
                const token = utility.generateAccessToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null });
                const refreshToken = await utility.generateRefreshToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null })
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

router.post('/notes/create', utility.authenticate, (req, res) => {
    const { comment, images, userId } = req.body
    Note.create({ comment, images: JSON.stringify(images), userId }).then(createdNote => {
        res.json({
            note: createdNote
        })
    }).catch(err => {
        res.status(500).json({
success:false,
message:err.toString()
})
    })
})

router.get('/:id/notes', utility.authenticate, (req, res, next) => {
    const userId = req.params.id;
    Note.findAll({
        where: {
            userId
        }
    }).then(notes => {
        res.json(notes)

    }).catch(err => {
        res.status(500).json({
success:false,
message:err.toString()
})
    })
});

router.get('/store/:id', utility.authenticate, (req, res, next) => {
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
success:false,
message:err.toString()
})
    })
});



router.get('/count/store/:id', utility.authenticate, (req, res, next) => {
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
success:false,
message:err.toString()
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
success:false,
message:err.toString()
})
    })
});

router.put('/edit', utility.authenticate, (req, res, next) => {
    User.findOne({
        where: {
            id: req.body.id,
        }
    }).then(user => {
        console.log(user)
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
success:false,
message:err.toString()
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
                }, include: ['store']
            });
            const accessToken = utility.generateAccessToken({ id: user.id, firstName: user.firstName, lastName: user.lastName, store: user.store ? user.store.id : null })
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

function comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}





module.exports = router;