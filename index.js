function logError(err) {
    console.error(err)
    process.exit(1)
}

process.on('uncaughtException', logError)
process.on('unhandledRejection', logError)

const { exchange, pair, dsl, tickrate } = require('./src/arguments.js')
const ccxt                              = require ('ccxt')
const { includes }                      = require('lodash/fp')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
    if (!includes(exchange)(ccxt.exchanges))
        throw 'Exchange "' + exchange + '" is not supported.'
    if (!process.env.API_KEY || !process.env.SECRET)
        throw 'Please set API_KEY and SECRET env variables.'
    x = new ccxt[exchange]({
        apiKey: process.env.API_KEY,
        secret: process.env.SECRET
    })
    console.log(x.apiKey)
}

const timer = async (tickrate, callback) => {
    if (tickrate < 5) throw "Tickrate is too fast"
    callback()
    await sleep(tickrate * 1000) // Tick every N seconds
    timer(tickrate)
}

main()
