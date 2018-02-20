const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split, round }   = require ('lodash/fp')
const chalk = require('chalk')

const sell = async (exchange, pair, price, volume) => {

    const openOrders = await exchange.fetchOpenOrders(pair)
    // console.log("Open Orders:", !isEmpty(openOrders))
    console.log("Open Orders:", openOrders)

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

    const amount = coinBalance //round((((currencyBalance / 100) * volume) / price), 8)
    console.log("Amount to sell:", amount)

    const dist = ((price / askPrice) - 1) * 100
    console.log("Distance to Target Price", dist.toFixed(2), "%")
    console.log("Sell Trigger is between:", trigger_high, "and", trigger_low)

    // cancel all expired orders (older than 1 min)
    await cancelExpiredOrders(exchange, pair)

    if (askPrice < trigger_high
        && askPrice > trigger_low
        && usdBalance > 1
        && isEmpty(openOrders)) { // we probably did not buy the coin yet
        const order = await exchange.createLimitSellOrder(pair, amount, price)
        console.log(chalk.bgRed("Sell order placed!"))
        return true
    }

    if (usdBalance < 1) { // we already bought our desired coin
        console.log("sold")
        return false
    }

    if (isEmpty(openOrders)) {
        console.log("wait for sell trigger...\n")
        return true
    }

    if (!isEmpty(openOrders)) {
        console.log("buy order executed")
        console.log("wait until buy order gets filled...")
        return true
    }

}

module.exports = {
    sell: sell
}
