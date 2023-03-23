const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Subscription, Address, RefreshToken, Note } = require('../models');

//Register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, phone, country, street, city, state, postalCode, language, entryDate, salary, functionInStore, worksInStore } = req.body
    try {
        const user = await User.findOne({
            where: {
                email
            }
        })
        if (user) res.json({ success: false, message: 'The email is already being used' })
        else {
            bcrypt.genSalt(10, async (err, salt) => {
                if (err) res.json(err);
                bcrypt.hash(password, salt, async (err, hash) => {
                    if (err) res.json(err);
                    const createdUser = await User.create({ firstName, lastName, email, password, phone, language, password: hash, entryDate, salary, functionInStore, worksInStore })
                    const createdAddress = await Address.create({ userId: createdUser.id, country, street, city, state, postalCode })
                    const createdSubscription = await Subscription.create({ userId: createdUser.id, duration: 'TRIAL' })
                    const token = generateAccessToken(createdUser.toJSON());
                    res.json({
                        success: true,
                        token
                    })
                })
            })
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


router.post('/authenticate', async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({
        where: {
            email
        }
    });
    if (!user) {
        return res.json({ success: false, error: "Utilisateur non trouvé" });
    }

    comparePassword(password, user.password, async (err, isMatch) => {
        if (err) res.json(err);
        if (isMatch) {
            const token = generateAccessToken(user.toJSON());
            const refreshToken = await generateRefreshToken(user.toJSON())
            // **************************************** LOCAL STORAGE **********************************
            res.json({
                success: true,
                token,
                refreshToken
            })
            //********************************************************
        } else {
            return res.json({ success: false, error: 'Mot de passe incorrect !' });
        }
    })

});

router.post('/notes/create', (req, res) => {
    const { comment, images, userId } = req.body
    Note.create({ comment, images: JSON.stringify(images), userId }).then(createdNote => {
        res.json({
            note: createdNote
        })
    }).catch(err => {
        res.status(500).json(err)
    })
})

router.get('/:id/notes', (req, res, next) => {
    const userId = req.params.id;
    Note.findAll({
        where: {
            userId
        }
    }).then(notes => {
        res.json(notes)

    }).catch(err => {
        res.status(500).json(err)
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
        jwt.verify(refreshToken, process.env.SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({ name: user.name })
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




router.get('/profile/:id', authenticate, async (req, res, next) => {
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

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.SECRET, { expiresIn: '15s' })
}

async function generateRefreshToken(user) {
    try {
        const refreshToken = await RefreshToken.create({ value: jwt.sign(user, process.env.SECRET) });
        console.log(refreshToken.value)
        return refreshToken.value;

    } catch (err) {
        return ""
    }
}

module.exports = router;