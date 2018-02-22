const assert                    = require('assert')
const param                     = require('commander')
const { version }               = require('./package.json')
const error                     = require ('./src/error.js')
const ccxt                      = require ('ccxt')
const { includes, defaultTo }   = require('lodash/fp')
const { trade }                   = require('./src/trade.js')
const { dsl }                   = require('./src/dsl.js')
const { ticker }                = require('./src/ticker.js')
const { validate }              = require('./src/validation.js')
const { status }                = require('./src/status.js')

param
    .version(version)
    .option('-b, --buy', 'Buy a coin at a specific price')
    .option('--sell', 'Buy a coin at a specific price')
    .option('-d, --dsl', 'Set a dynamic stop loss (in %)')
    .option('-e, --exchange <string>', 'Exchange to trade on')
    .option('-c, --pair <string>', 'Pair to trade')
    .option('--bestprice', 'Buy or sell for current best ASK/BID price')
    .option('--debug', 'Debug mode with sandbox API')
    .option('-p, --price <n>', 'Price to buy at', parseFloat)
    .option('-a, --amount <n>', 'Volume of balance in %', parseInt)
    .option('-s, --status', 'Print all available informations for your account')
    .option('-t, --tickrate <n>', 'Tickrate for polling', parseInt)
    .parse(process.argv)

// command line parameter validation, throws exception if param is invalid
validate(param)

const exchange = new ccxt[param.exchange]({
        apiKey: process.env.API_KEY,
        secret: process.env.SECRET,
        password: process.env.API_PASS,
    })

const tickrate = defaultTo(30)(param.tickrate)
const volume = defaultTo(100)(param.volume)


if (param.debug) {
    if (!exchange.urls['test'])
        throw "Sorry there is no SANDBOX API for " + param.exchange
    exchange.urls['api'] = exchange.urls['test']
}

if (param.status) {
    status(exchange)
}

const parameter = {
    exchange: exchange,
    pair: param.pair,
    price: param.price,
    amount: param.amount,
    sell: param.sell,
    buy: param.buy,
    bestprice: param.bestprice
}

if (param.buy || param.sell)
    ticker(tickrate, trade, parameter)

if (param.dsl)
    ticker(tickrate, dsl, exchange, param.pair, param.price, param.dsl)

