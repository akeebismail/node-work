const {clearHash} = require('../services/cache')
module.exports = async (res, req, next) => {
     await next()
    clearHash(req.user.id);
}