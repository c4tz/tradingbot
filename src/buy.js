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

    const { bidPrice, askPrice, trigger_high, exchange,
        pair, price, currencyBalance,  amount,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    console.log(chalk.green("Amount of", coin, "to buy:", amount))

    if (askPrice < trigger_high
        && askPrice > trigger_low
        && currencyBalance < amount
        && isEmpty(openOrders)) {
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
        console.log(chalk.bgGreen("Buy order placed!"))
        return true
    }

    if (currencyBalance > amount && isEmpty(openOrders)) {
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
