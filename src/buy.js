const error                         = require ('./error.js')
const { ticker }                    = require ('./ticker.js')
const { dsl }                       = require ('./dsl.js')
const { getUSDBalance, getBalance,
        getCoin, getCurrency }      = require ('./common.js')
const { map, isNil, split }         = require ('lodash/fp')


const buy = async (exchange, pair, price, volume) => {
    const openOrders = await exchange.fetchOpenOrders(pair)
    const coin = getCoin(pair)

    const coinBalance = await getBalance(exchange, coin)
    console.log("Current coin balance:", coinBalance)

    const currencyBalance = await getBalance(exchange, getCurrency(pair))
    console.log("Current currency balance:", currencyBalance)

    const usdtBalance = await getUSDBalance(exchange, coin)
    console.log("Current USD balance:", usdtBalance)

    if (usdtBalance < 1 && !openOrders) { // we probably did not buy the coin yet
        const amount = (currencyBalance / 100) * volume
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
        return true
    }

    if (usdtBalance > 1) { // we already bought our desired coin
        return false
    }
}

module.exports = {
    buy: buy
}
