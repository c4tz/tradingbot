const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')

const { map, isEmpty, isNil, split }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')

const buy = async (exchange, pair, price, volume, bestprice) => {
    const openOrders = await exchange.fetchOpenOrders(pair)
    const coin = getCoin(pair)

    const coinBalance = await getBalance(exchange, coin)
    console.log(chalk.bold("Current", coin, "balance:", coinBalance))

    const currencyBalance = await getBalance(exchange, getCurrency(pair))
    console.log(chalk.bold("Current", getCurrency(pair), "balance:", currencyBalance))

    const usdBalance = await getUSDBalance(exchange, coin)
    console.log(chalk.bold("Current", coin, "value expressed in USD:", usdBalance))

    const askPrice = await getAskPrice(exchange, pair)
    console.log(chalk.yellow("Current ASK Price:", askPrice))

    if (bestprice) price = askPrice

    // buy trigger is 0.1 % higher than buy order
    // the money is not freezed until the trigger is hit and
    // the order is placed on the exchange
    // example: if we want to buy at 10.000 then
    // the buy order is triggered if price falls below 10.010
    const trigger_high = price + (price * 0.001)
    const trigger_low = price - (price * 0.001)

    const dist = ((price / askPrice) - 1) * 100
    console.log(chalk.blue("Distance to Target Price", dist.toFixed(2), "%"))
    console.log(chalk.blue("Sell Trigger is between:", trigger_high, "and", trigger_low))

    const amount = round((((currencyBalance / 100) * volume) / price) * 0.997, 4)
    console.log(chalk.green("Amount of", coin, "to buy:", amount))

    await cancelExpiredOrders(exchange, pair)

    if (askPrice < trigger_high
        && askPrice > trigger_low
        && usdBalance < 1
        && isEmpty(openOrders)) { // we probably did not buy the coin yet
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
        console.log(chalk.bgGreen("Buy order placed!"))
        return true
    }

    if (usdBalance > 1 && isEmpty(openOrders)) { // we already bought our desired coin
        console.log("bought")
        return false
    }

    if (isEmpty(openOrders)) {
        console.log(chalk.grey("wait for buy trigger...\n"))
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
