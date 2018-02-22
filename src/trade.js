const error                             = require ('./error.js')
const { ticker }                        = require ('./ticker.js')
const { dsl }                           = require ('./dsl.js')
const { getUSDBalance, getBalance, cancelAllOrders,
    cancelExpiredOrders, getCoin, getCurrency, getPrice }
                                       = require ('./common.js')
const { map, isEmpty, isNil, split, size }   = require ('lodash/fp')
const { round }   = require ('lodash/math')
const chalk = require('chalk')
const strategyBuy                   = require('./buy.js')
const strategySell                   = require('./sell.js')

const trade = async (parameter) => {

    const { exchange, pair, volume,
        initalCoinBalance, initalCurrencyBalance,
        bestprice, buy, sell, amount } = parameter
    let { price } = parameter

    const openOrders = await exchange.fetchOpenOrders(pair)

    const coin = getCoin(pair)

    console.log(chalk.bgBlue("Bot is trying to", buy ? "buy" : "sell", amount, coin, "on", exchange.name))

    if (!isEmpty(openOrders)) {
        const printOrder = order => {
            console.log(chalk.bold("Open Order:",
                "Type", order.side,
                "Pair", order.symbol,
                "Price:", order.price,
                "Size:", order.amount,
                "Filled:", order.filled))
        }
        map(printOrder)(openOrders)
    }

    const coinBalance = await getBalance(exchange, coin)
    const usdBalance = await getUSDBalance(exchange, coin)
    console.log("Current balance:", coinBalance, coin, "| Initial balance:", initalCoinBalance, coin, "| Equivalent to:", usdBalance.toFixed(2), "USD")

    const currencyBalance = await getBalance(exchange, getCurrency(pair))
    console.log("Current balance:", currencyBalance, getCurrency(pair), "| Initial balance:",  initalCurrencyBalance, getCurrency(pair))


    const tickerPrice = (await getPrice(exchange, pair))
    console.log(chalk.yellow("ASK Price:", tickerPrice.ask, getCurrency(pair), "| BID Price:", tickerPrice.bid, getCurrency(pair)))

    if (bestprice) price = buy ? tickerPrice.ask : tickerPrice.bid

    // buy trigger is 0.1 % higher than buy order
    // the money is not freezed until the trigger is hit and
    // the order is placed on the exchange
    // example: if we want to buy at 10.000 then
    // the buy order is triggered if price falls below 10.010
    const trigger_high = price + (price * 0.001)
    const trigger_low = price - (price * 0.001)


    const dist = ((price / tickerPrice.ask) - 1) * 100
    console.log(chalk.blue("Distance to Target Price", dist.toFixed(2), "%", "| Trigger is between:", trigger_high, "and", trigger_low))

    const tradeParameter = {
        price: price,
        dist: dist,
        pair: pair,
        exchange: exchange,
        trigger_high: trigger_high,
        trigger_low: trigger_low,
        openOrders: openOrders,
        initalCoinBalance: initalCoinBalance,
        initalCurrencyBalance: initalCurrencyBalance,
        coin: coin,
        coinBalance: coinBalance,
        currencyBalance: currencyBalance,
        usdBalance: usdBalance,
        amount: amount,
        askPrice: tickerPrice.ask,
        bidPrice: tickerPrice.bid
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
