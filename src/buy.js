const error                         = require ('./error.js')
const { ticker }                    = require ('./ticker.js')
const { dsl }                       = require ('./dsl.js')
const { getUSDTBalance, getBalance,
        getCoin, getCurrency }      = require ('./common.js')
const { map, isNil, split }         = require ('lodash/fp')


const trade = async (exchange, pair, price, volume, dsl) => {
    openOrders = await exchange.fetchOpenOrders(pair)
    coin = getCoin(pair)
    coinBalance = getBalance(exchange, coin)
    currencyBalance = getBalance(exchange, getCurrency(pair))
    usdtBalance = getUSDTBalance(exchange, coin, coinBalance)
    if (usdtBalance < 1 && !openOrders) { // we probably did not buy the coin yet
        amount = (currencyBalance / 100) * volume
        order = await exchange.createLimitBuyOrder(pair, amount, price)
        return true
    }
    else if (usdtBalance > 1) { // we already bought our desired coin
        dsl(exchange, pair, price, volume, dsl, tickrate)
        return false
    }
}

const buy = async (exchange, pair, price, volume, dsl, tickrate) => {
    ticker(tickrate, trade, exchange, pair, price, volume, dsl)
}

module.exports = {
    buy: buy
}