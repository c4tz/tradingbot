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
        pair, price, currencyBalance,  amount, coinBalance,
        initalCoinBalance, initalCurrencyBalance,
        trigger_low, usdBalance, openOrders, coin } = tradeParameter

    console.log(chalk.green("Amount of", coin, "to buy:", amount))

    const targetAmount = (initalCoinBalance + (amount * 0.997))

    console.log(chalk.bold("Target", coin, "amount:", initalCoinBalance + amount))

    if (coinBalance >= targetAmount && isEmpty(openOrders)) {
        console.log("Buy successfull. Hit the target amount!")
        return false
    }

    if (askPrice < trigger_high
        && askPrice > trigger_low
        && coinBalance <= targetAmount
        && isEmpty(openOrders)) {
        const order = await exchange.createLimitBuyOrder(pair, amount, price)
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
