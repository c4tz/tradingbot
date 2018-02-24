const error                                = require ('./error.js')
const { ticker }                           = require ('./ticker.js')
const { dsl }                              = require ('./dsl.js')
const { getUSDBalance, getBalance,
    cancelExpiredOrders, printOpenOrders,
    getCoin, getCurrency,
    getPrice }                             = require ('./common.js')
const { map, isEmpty, isNil, split, size } = require ('lodash/fp')
const { round }                            = require ('lodash/math')
const chalk                                = require('chalk')
const stratBuy                             = require('./buy.js')
const stratSell                            = require('./sell.js')

const fetchExchangeInfo = async (exchange, pair) => {
    const coin = getCoin(pair)
    // batch all api requests in parallel
    return await Promise.all(
            [exchange.fetchOpenOrders(pair),
             getBalance(exchange, coin),
             getBalance(exchange, getCurrency(pair)),
             getPrice(exchange, pair),
             getUSDBalance(exchange, coin),
             // cancel all expired orders (older than 1 min)
             cancelExpiredOrders(exchange, pair)]
        );
}

const trade = async (parameter) => {

    const { exchange, pair, initalCoinBalance, initalCurrencyBalance,
        bestprice, buy, sell, amount } = parameter
    const coin = getCoin(pair)

    const [openOrders, coinBalance, currencyBalance,
        tickerPrice, usdBalance, _] = await fetchExchangeInfo(exchange, pair)

    console.log(chalk.bgBlue("Bot is trying to",
        buy ? "buy" : "sell", amount, coin, "on", exchange.name))

    printOpenOrders(openOrders)

    console.log("Current balance:", coinBalance, coin,
        "| Initial balance:", initalCoinBalance, coin,
        "| Equivalent to:", usdBalance.toFixed(2), "USD")

    console.log("Current balance:", currencyBalance, getCurrency(pair),
        "| Initial balance:",  initalCurrencyBalance, getCurrency(pair))

    console.log(chalk.yellow("ASK Price:", tickerPrice.ask, getCurrency(pair),
        "| BID Price:", tickerPrice.bid, getCurrency(pair)))

    const price = bestprice ?
        (buy ? tickerPrice.ask : tickerPrice.bid) : parameter.price

    // buy trigger is 0.1 % higher than buy order
    // the money is not freezed until the trigger is hit and
    // the order is placed on the exchange
    // example: if we want to buy at 10.000 then
    // the buy order is triggered if price falls below 10.010
    const trigger_high = price + (price * 0.001)
    const trigger_low = price - (price * 0.001)

    const dist = ((price / tickerPrice.ask) - 1) * 100

    console.log(chalk.blue("Distance to Target Price", dist.toFixed(2), "%",
        "| Trigger is between:", trigger_high, "and", trigger_low))

    const tradeParameter = {
        ...parameter,
        price: price,
        dist: dist,
        trigger_high: trigger_high,
        trigger_low: trigger_low,
        openOrders: openOrders,
        coin: coin,
        coinBalance: coinBalance,
        currencyBalance: currencyBalance,
        usdBalance: usdBalance,
        askPrice: tickerPrice.ask,
        bidPrice: tickerPrice.bid
    }

    if (buy) return await stratBuy.buy(tradeParameter)
    if (sell) return await stratSell.sell(tradeParameter)
}

module.exports = {
    trade: trade
}
