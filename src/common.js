const axios                                     = require('axios')
const { map, filter, split,
    first, isEmpty, tail, flow }                = require('lodash/fp')
const ccxt                                      = require ('ccxt')
const chalk                                     = require('chalk')
const retry                                     = require('async-retry')
const memoize                                   = require("memoizee")

const USDAPI = `https://min-api.cryptocompare.com/data/price?fsym=`

// retry api calls up to 500 times in case of error
const re = async (f) => await retry(f, { retries: 500 })

// cache api requests for 500 ms and prefetch results
const m = f => memoize(f, { promise: true, maxAge: 500, preFetch: true })

const getCoin = pair => flow(split('/'), first)(pair)
const getCurrency = pair => flow(split('/'), tail, first)(pair)

const getUSDBalance = m(async (exchange, coin) =>
    await re(async _ =>
        (await getBalance(exchange, coin)) * await (getUSDValue(coin))))

const getUSDValue = m(async coin =>
    await re(async _ =>
        (await axios.get(`${USDAPI}${coin}&tsyms=USD`)).data.USD))

const getBalance = m(async (exchange, coin) =>
    await re(async _ =>
        parseFloat((await exchange.fetchBalance())['total'][coin])))

const getPrice = m(async (exchange, pair) =>
    await re(async _ =>
        await exchange.fetchTicker(pair)))

const cancelExpiredOrders = async (exchange, pair) => {
    const now = new Date().getTime() // unix timestamps with milliseconds
    try {
        flow(
            filter(o => (now - o.timestamp) > (3 * 1000) ),
            map(order => exchange.cancelOrder(order.id))
        )(await exchange.fetchOpenOrders(pair))
    } catch (e) {
    if (error instanceof ccxt.ExchangeNotAvailable) {
        // this error happens if the order has been closed already
    } else {
       exchangeErrorHander(e)
    }
    }
}

const printOpenOrders = openOrders => {
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
}

const exchangeErrorHander = error => {
    if (error instanceof ccxt.InsufficientFunds) {
        console.log(chalk.bgRed("Insufficient funds"))
        return false
    }
    if (error instanceof ccxt.RequestTimeout) {
        console.log(chalk.bgRed("[Timeout Error]", e.message))
        console.log(chalk.bgRed("Might be a issue with the API. Retry ..."))
        return true
    }
     throw error
}

module.exports = {
    getUSDBalance: getUSDBalance,
    getBalance: getBalance,
    printOpenOrders: printOpenOrders,
    getCoin: getCoin,
    getPrice: getPrice,
    exchangeErrorHander: exchangeErrorHander,
    cancelExpiredOrders: cancelExpiredOrders,
    getCurrency: getCurrency
}
