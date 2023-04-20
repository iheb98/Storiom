const jwt = require('jsonwebtoken');
const { RefreshToken } = require('./models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    })
}

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

const paginate = (query, { page, pageSize }) => {
    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);
    return {
        ...query,
        offset,
        limit,
    };
};

const fromTo = (from, to) => {
    let query = {
        [Op.gte]: 0,
    }
    if (!isNaN(from) && !isNaN(to)) 
        query = {
            [Op.gte]: from,
            [Op.lte]: to
        }
    else if (!isNaN(from))
        query = {
            [Op.gte]: from,
        }
    else if (!isNaN(to))
        query = {
            [Op.lte]: to
        }
    return {
        ...query
    };
};

function generateAccessToken(user) {
    delete user.iat
    let jwttoken = jwt.sign(user, process.env.SECRET, { expiresIn: '15s' })
    return jwttoken
}

async function generateRefreshToken(user) {
    try {
        const refreshToken = await RefreshToken.create({ value: jwt.sign(user, process.env.SECRET) });
        return refreshToken.value;

    } catch (err) {
        console.log("error ", err)
        return ""
    }
}

module.exports = { comparePassword, authenticate, generateAccessToken, generateRefreshToken, paginate, Op, fromTo }