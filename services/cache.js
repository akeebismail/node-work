const mongoose = require('mongoose')
const redis = require('redis')
const redisURL = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisURL)
const util = require('util')
client.hget = util.promisify(client.hget)

const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.cache = function (options = {}) {
    console.log('only use cache')
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '')
    return this
}
mongoose.Query.prototype.exec = async function () {
    console.log('Im about to run a  query');
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    console.log(this.getQuery())
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))
    //check if value exists in redis
    const cacheValue = await client.hget(this.hashKey, key)
    if (cacheValue) {
        console.log(cacheValue)
        const doc = JSON.parse(cacheValue)
        return Array.isArray(doc) ?
            doc.map(d => new this.model(d))
            : new this.model(doc)
    }
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, JSON.stringify(result), 'EX', 10)
    console.log(result)
    return result
}
module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}