const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders, exchangeErrorHander,
    cancelExpiredOrders, getCoin, getCurrency, getAskPrice }
                                       = require ('./common.js')

const { map, isEmpty, isNil, split, attempt }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')
const ccxt                      = require ('ccxt')

const buy = async (tradeParameter) => {

    const { bidPrice, askPrice, trigger_high, exchange,
        pair, price, currencyBalance,  amount, coinBalance,
        initalCoinBalance, initalCurrencyBalance,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter


    const realTarget = initalCoinBalance + amount
    const targetAmount = (initalCoinBalance + (amount * 0.997))
    const buyAmount = (realTarget - coinBalance).toFixed(8)

    console.log(chalk.red("Target", coin, "amount:", initalCoinBalance + amount))
    console.log(chalk.green("Amount of", coin, "to buy:", buyAmount))


    const triggerHit = askPrice < trigger_high && askPrice > trigger_low
    const targetReached = coinBalance >= targetAmount

    if (targetReached && isEmpty(openOrders)) {
        console.log("Buy successfull. Hit the target amount!")
        return false
    }

    if (triggerHit && !targetReached && isEmpty(openOrders)) {
        try {
            const order = await exchange.createLimitBuyOrder(pair, buyAmount, price)
        } catch (error) {
            return exchangeErrorHander(error)
        }
        console.log(chalk.bgGreen("Buy order placed!"))
        return true
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
