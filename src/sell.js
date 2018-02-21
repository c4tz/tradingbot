const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')

const sell = async (tradeParameter) => {

    const { askPrice, trigger_high, exchange, pair,
        price, volume, currencyBalance, coinBalance,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    const amount = round(((coinBalance * volume * 100) / price) * 0.997, 8)
    console.log(chalk.green("Amount of", coin, "to sell:", amount))

    console.log(askPrice)
    console.log(usdBalance)
    console.log(openOrders)

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
        console.log(chalk.grey("wait for sell trigger...\n"))
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
