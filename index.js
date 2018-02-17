const assert                    = require('assert')
const param                     = require('commander')
const { version }               = require('./package.json')
const error                     = require ('./src/error.js')
const ccxt                      = require ('ccxt')
const { includes, defaultTo }   = require('lodash/fp')
const { buy }                   = require('./src/buy.js')
const { dsl }                   = require('./src/dsl.js')
const { ticker }                = require('./src/ticker.js')
const { validate }              = require('./src/validation.js')

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

// command line parameter validation, throws exception if param is invalid
validate(param)

const exchange = new ccxt[param.exchange]({
        apiKey: process.env.API_KEY,
        secret: process.env.SECRET
    })

const tickrate = defaultTo(30)(param.tickrate)
const volume = defaultTo(100)(param.volume)

if (param.buy)
    ticker(tickrate, buy, exchange, param.pair, param.price, volume)

if (param.dsl)
    ticker(tickrate, dsl, exchange, param.pair, param.price, param.dsl)
