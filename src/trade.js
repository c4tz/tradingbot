const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')
const strategyBuy                   = require('./buy.js')
const strategySell                   = require('./sell.js')

const trade = async (parameter) => {

    const { exchange, pair, volume, bestprice, buy, sell } = parameter
    let { price } = parameter

    const openOrders = await exchange.fetchOpenOrders(pair)
    console.log("Open Orders:", openOrders)

    const coin = getCoin(pair)

    const coinBalance = await getBalance(exchange, coin)
    console.log(chalk.bold("Current", coin, "balance:", coinBalance))

    const currencyBalance = await getBalance(exchange, getCurrency(pair))
    console.log(chalk.bold("Current", getCurrency(pair), "balance:", currencyBalance))

    const usdBalance = await getUSDBalance(exchange, coin)
    console.log(chalk.bold("Current", coin, "value expressed in USD:", usdBalance))

    const tickerPrice = (await getPrice(exchange, pair))
    console.log(chalk.yellow("Current ASK Price:", tickerPrice.ask))
    console.log(chalk.yellow("Current BID Price:", tickerPrice.bid))

    if (bestprice) price = buy ? tickerPrice.ask : tickerPrice.bid

    // buy trigger is 0.1 % higher than buy order
    // the money is not freezed until the trigger is hit and
    // the order is placed on the exchange
    // example: if we want to buy at 10.000 then
    // the buy order is triggered if price falls below 10.010
    const trigger_high = price + (price * 0.001)
    const trigger_low = price - (price * 0.001)


    const dist = ((price / tickerPrice.ask) - 1) * 100
    console.log(chalk.blue("Distance to Target Price", dist.toFixed(2), "%"))
    console.log(chalk.blue("Trigger is between:", trigger_high, "and", trigger_low))

    const tradeParameter = {
        price: price,
        dist: dist,
        pair: pair,
        exchange: exchange,
        trigger_high: trigger_high,
        trigger_low: trigger_low,
        openOrders: openOrders,
        coin: coin,
        coinBalance: coinBalance,
        currencyBalance: currencyBalance,
        usdBalance: usdBalance,
        volume: volume,
        askPrice: tickerPrice.ask
    }

    // cancel all expired orders (older than 1 min)
    await cancelExpiredOrders(exchange, pair)

    if (buy) {
       return await strategyBuy.buy(tradeParameter)
    }
    if (sell) {
        return await strategySell.sell(tradeParameter)
    }
}

module.exports = {
    trade: trade
}
