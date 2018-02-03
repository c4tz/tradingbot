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
    if (includes(ccxt.exchanges, exchange)) {
        x = new ccxt[exchange]()
    } else {
        throw 'Exchange "' + exchange + '" is not supported.'
    }
}

const timer = async (tickrate) => {
    if (tickrate < 5) throw "Tickrate is too fast"
    main()
    await sleep(tickrate * 1000) // Tick every N seconds
    timer(tickrate)
}

timer(tickrate)
