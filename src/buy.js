const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance,
    getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split, round }   = require ('lodash/fp')

const buy = async (exchange, pair, price, volume) => {
    const openOrders = await exchange.fetchOpenOrders(pair)
    const coin = getCoin(pair)

    const coinBalance = await getBalance(exchange, coin)
    console.log("Current coin balance:", coinBalance)

    const currencyBalance = await getBalance(exchange, getCurrency(pair))
    console.log("Current currency balance:", currencyBalance)

    const usdBalance = await getUSDBalance(exchange, coin)
    console.log("Current USD balance:", usdBalance)

    const askPrice = await getAskPrice(exchange, pair)
    console.log("Current ASK Price:", askPrice)

    // buy trigger is 0.1 % higher than buy order
    // the money is not freezed until the trigger is hit and
    // the order is placed on the exchange
    // example: if we want to buy at 10.000 then
    // the buy order is triggered if price falls below 10.010
    const trigger_high = price + (price * 0.001)
    const trigger_low = price - (price * 0.001)

    if (askPrice < trigger_high
        && askPrice > trigger_low
        && usdBalance < 1
        && isEmpty(openOrders)) { // we probably did not buy the coin yet
        const amount =  round((((currencyBalance / 100) * volume) / price), 8)
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
        console.log("buy")
        return true
    }

    if (usdBalance > 1) { // we already bought our desired coin
        console.log("bought")
        return false
    }

    if (isEmpty(openOrders)) {
        console.log("wait for buy trigger...")
        return true
    }

    if (!isEmpty(openOrders)) {
        console.log("buy order executed")
        console.log("wait until buy order gets filled...")
        return true
    }

}

module.exports = {
    buy: buy
}
