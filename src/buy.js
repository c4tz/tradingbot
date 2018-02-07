const error         = require ('./error.js')
const { ticker }    = require ('./ticker.js')
const ccxt          = require ('ccxt')
const { includes }  = require('lodash/fp')

const trade = async (exchange, pair, dsl, tickrate) => {
    func = async (test, lol) => {console.log(test, lol)}
    ticker(5, func, 'test', 'lol')
}

module.exports = {
    trade: trade
}