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
        offset: offset ? offset : undefined,
        limit: limit ? limit : undefined,
    };
};
const buildQuery = (sentQuery) => {
    if (!sentQuery) return {};
    let query = sentQuery.split(',')
    let finalQuery = {}
    for (let item of query) {
        let name = item.substring(0, item.indexOf(' '))
        item = item.substring(item.indexOf(' ') + 1)
        let operator = item.substring(0, item.indexOf(' '))
        item = item.substring(item.indexOf(' ') + 1)
        let value = item.substring(1, item.length - 1)
        if (name.indexOf(".") == -1) {
            if (operator == '~') {
                finalQuery[name] = {
                    [Op.like]: '%' + value + '%'
                }
            } else if (operator == '=') {
                finalQuery[name] = {
                    [Op.eq]: value
                }
            } else if (operator == '>') {
                finalQuery[name] = {
                    ...finalQuery[name],
                    [Op.gte]: value
                }
            } else if (operator == '<') {
                finalQuery[name] = {
                    ...finalQuery[name],
                    [Op.lte]: value
                }
            } else if (operator == 'isnull') {
                finalQuery[name] = {
                    [Op.is]: null
                }
            }
        }

    }
    return finalQuery
};

const fromTo = (from, to) => {
    let query = {
        [Op.ne]: Number.MIN_VALUE,
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
    let jwttoken = jwt.sign(user, process.env.SECRET, { expiresIn: '1h' })
    return jwttoken
}

async function generateRefreshToken(user) {
    try {
        const refreshToken = await RefreshToken.create({ value: jwt.sign(user, process.env.SECRET) });
        return refreshToken.value;

    } catch (err) {
        return ""
    }
}

function getSimpleDate(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

module.exports = { comparePassword, authenticate, generateAccessToken, generateRefreshToken, paginate, Sequelize, Op, fromTo, buildQuery, getSimpleDate }