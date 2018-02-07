
const assert                    = require('assert')
const param                     = require('commander')
const { version }               = require('./package.json')
const { includes, defaultTo }   = require('lodash/fp')

param
    .command('buy <exchange> <pair> <price>')
    .option('-t, --tickrate <n>', 'Tickrate for polling', parseInt)
    .option('-d, --dsl <n>', 'Tickrate for polling', parseInt)
    .action(function(exchange, pair, price, options){
        if (options.tickrate && options.tickrate < 5) {
            console.warn("Tickrate is too fast, setting it to 5")
            options.tickrate = 5
        }
        var buy = require('./src/buy.js')
        buy.trade(
            exchange,
            pair,
            price,
            defaultTo(5)(options.dsl),
            defaultTo(30)(options.tickrate)
        )
    });

param.version(version)
param.parse(process.argv)
