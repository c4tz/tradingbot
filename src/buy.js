const error                         = require ('./error.js')
const { ticker }                    = require ('./ticker.js')
const { dsl }                       = require ('./dsl.js')
const { getUSDTBalance, getBalance,
        getCoin, getCurrency }      = require ('./common.js')
const { map, isNil, split }         = require ('lodash/fp')


const trade = async (exchange, pair, price, volume, dsl) => {
    const openOrders = await exchange.fetchOpenOrders(pair)
    const coin = getCoin(pair)
    const coinBalance = getBalance(exchange, coin)
    const currencyBalance = getBalance(exchange, getCurrency(pair))
    const usdtBalance = getUSDTBalance(exchange, coin, coinBalance)

    if (usdtBalance < 1 && !openOrders) { // we probably did not buy the coin yet
        const amount = (currencyBalance / 100) * volume
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
        return true
    }

    if (usdtBalance > 1) { // we already bought our desired coin
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
