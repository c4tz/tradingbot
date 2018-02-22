const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders, exchangeErrorHander,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')

const sell = async (tradeParameter) => {

    const { bidPrice, askPrice, trigger_high, exchange, pair,
        price, currencyBalance, coinBalance, amount,
        initalCoinBalance, initalCurrencyBalance,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    const realTarget = initalCoinBalance - amount
    const targetAmount = initalCoinBalance - (amount * 0.997)

    const sellAmount = (coinBalance - realTarget).toFixed(8)

    console.log(chalk.red("Target", coin, "amount:", realTarget))
    console.log(chalk.green("Amount of", coin, "to sell:", sellAmount))

    const triggerHit = bidPrice < trigger_high && bidPrice > trigger_low
    const targetReached = coinBalance <= targetAmount

    if (targetReached && isEmpty(openOrders)) {
        console.log("Sell successfull. Hit the target amount!")
        return false
    }

    if (triggerHit && !targetReached && isEmpty(openOrders)) {
        try {
            const order = await exchange.createLimitSellOrder(pair, sellAmount, price)
        } catch (error) {
            return exchangeErrorHander(error)
        }
        console.log(chalk.bgRed("Sell order placed!"))
        return true
    }

    if (isEmpty(openOrders)) {
        console.log(chalk.grey("wait for sell trigger...\n"))
        return true
    }

    if (!isEmpty(openOrders)) {
        console.log("sell order executed")
        console.log("wait until sell order gets filled...")
        return true
    }
}

module.exports = {
    sell: sell
}
