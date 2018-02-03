
const assert        = require('assert')
const param         = require('commander')
const { version }   = require('../package.json')
const { defaultTo } = require('lodash/fp')

param
    .version(version)
    .option('-e, --exchange <string>', 'Exchange to trade on')
    .option('-p, --pair <string>', 'Trading pair, e.g. ETH/BTC')
    .option('-d, --dsl <n>', 'Dynamic stop loss in percent', parseInt)
    .option('-t, --tickrate <n>', 'Tickrate for polling', parseInt)
    .parse(process.argv)

if (!param.exchange || !param.pair) throw "--exchange and --pair are required!"

module.exports = {
    exchange: param.exchange,
    pair: param.pair,
    dsl: defaultTo(5)(param.dsl),
    tickrate: defaultTo(30)(param.tickrate)
}