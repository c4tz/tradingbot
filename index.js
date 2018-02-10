
const assert                    = require('assert')
const param                     = require('commander')
const { version }               = require('./package.json')
const error                     = require ('./src/error.js')
const ccxt                      = require ('ccxt')
const { includes, defaultTo }   = require('lodash/fp')

function createExchange(exchange) {
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
    .command('buy <exchange> <pair> <price>')
    .option('-v, --volume <n>', 'Volume of balance in %', parseInt)
    .option('-t, --tickrate <n>', 'Tickrate for polling', parseInt)
    .option('-d, --dsl <n>', 'Tickrate for polling', parseInt)
    .action(function(exchange, pair, price, options){
        exchange = createExchange(exchange)
        if (!includes('/')(pair))
            throw 'Pair must be of ABC/XYZ format.'
        if (options.tickrate && options.tickrate < 5)
            console.warn("Tickrate is too fast, setting it to 5")
            options.tickrate = 5
        var { buy } = require('./src/buy.js')
        buy(
            exchange,
            pair,
            price,
            defaultTo(100)(options.volume),
            defaultTo(5)(options.dsl),
            defaultTo(30)(options.tickrate)
        )
    });

param.version(version)
param.parse(process.argv)
