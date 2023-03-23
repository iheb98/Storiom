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

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.SECRET, { expiresIn: '7200s' })
}

module.exports = { comparePassword, authenticate, generateAccessToken }