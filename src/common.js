const axios                                     = require('axios')
const { map, filter, split, first, tail, flow } = require('lodash/fp')
const ccxt                                      = require ('ccxt')
const chalk                                     = require('chalk')

const USDAPI = `https://min-api.cryptocompare.com/data/price?fsym=`

const getUSDBalance = async (exchange, coin) =>
    (await getBalance(exchange, coin)) * await (getUSDValue(coin))

const getUSDValue = async coin =>
    (await axios.get(`${USDAPI}${coin}&tsyms=USD`)).data.USD

const getBalance = async (exchange, coin) =>
    parseFloat((await exchange.fetchBalance())['total'][coin])

const getPrice = async (exchange, pair) =>
    await exchange.fetchTicker(pair)

const cancelExpiredOrders = async (exchange, pair) => {
    const now = new Date().getTime() // unix timestamps with milliseconds
    flow(
        filter(o => (now - o.timestamp) > (5 * 1000) ),
        map(order => exchange.cancelOrder(order.id))
    )(await exchange.fetchOpenOrders(pair))
}

const cancelAllOrders = async (exchange, pair) => {
    flow(
        map(order => exchange.cancelOrder(order.id))
    )(await exchange.fetchOpenOrders(pair))
}

const getCoin = pair => flow(split('/'), first)(pair)

const getCurrency = pair => flow(split('/'), tail, first)(pair)

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
    getCoin: getCoin,
    getPrice: getPrice,
    cancelAllOrders: cancelAllOrders,
    exchangeErrorHander: exchangeErrorHander,
    cancelExpiredOrders: cancelExpiredOrders,
    getCurrency: getCurrency
}
