const assert                    = require('assert')
const param                     = require('commander')
const { version }               = require('./package.json')
const error                     = require ('./src/error.js')
const ccxt                      = require ('ccxt')
const { includes, defaultTo }   = require('lodash/fp')
const { buy }                   = require('./src/buy.js')
const { dsl }                   = require('./src/dsl.js')
const { ticker }                = require('./src/ticker.js')

const createExchange = exchange => {
    if (!includes(exchange)(ccxt.exchanges))
        throw 'Exchange "' + exchange + '" is not supported.'
    if (!process.env.API_KEY || !process.env.SECRET)
        throw 'Please set API_KEY and SECRET env variables.'
    return new ccxt[exchange]({
        apiKey: process.env.API_KEY,
        secret: process.env.SECRET
    })
}

param
    .version(version)
    .option('-b, --buy', 'Buy a coin at a specific price')
    .option('-d, --dsl', 'Set a dynamic stop loss (in %)')
    .option('-e, --exchange <string>', 'Exchange to trade on')
    .option('-c, --pair <string>', 'Pair to trade')
    .option('-p, --price <n>', 'Price to buy at', parseInt)
    .option('-v, --volume <n>', 'Volume of balance in %', parseInt)
    .option('-t, --tickrate <n>', 'Tickrate for polling', parseInt)
    .parse(process.argv)

exchange = createExchange(param.exchange)


// TODO: validate.js
if (!includes('/')(param.pair))
    throw 'Pair must be of ABC/XYZ format.'
if (param.tickrate && param.tickrate < 5) {
    console.warn("Tickrate is too fast, setting it to 5")
    param.tickrate = 5
}

if (param.buy) {
    ticker(
        defaultTo(30)(param.tickrate),
        buy,
        exchange,
        param.pair,
        param.price,
        defaultTo(100)(param.volume)        
    )
}
if (param.dsl) {
    ticker(
        defaultTo(30)(param.tickrate),
        dsl,
        exchange,
        param.pair,
        param.price,
        param.dsl
    )
}