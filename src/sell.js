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

    const { bidPrice, askPrice, trigger_high, exchange, pair,
        price, currencyBalance, coinBalance, amount,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    console.log(chalk.green("Amount of", coin, "to sell:", amount))

    if (bidPrice < trigger_high
        && bidPrice > trigger_low
        && usdBalance > 10
        && isEmpty(openOrders)) {
        const order = await exchange.createLimitSellOrder(pair, amount, price)
        console.log(chalk.bgRed("Sell order placed!"))
        return true
    }

    if (coinBalance > amount && isEmpty(openOrders)) {
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
