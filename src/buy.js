const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')

const { map, isEmpty, isNil, split }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')

const buy = async (tradeParameter) => {

    const { askPrice, trigger_high, exchange,
        pair, price, currencyBalance,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    const amount = round((((currencyBalance / 100) * volume) / price) * 0.997, 8)
    console.log(chalk.green("Amount of", coin, "to buy:", amount))

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
