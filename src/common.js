const axios = require('axios')
const { map, filter, split, first, tail, flow }   = require('lodash/fp')

const USDAPI = `https://min-api.cryptocompare.com/data/price?fsym=`

const getUSDBalance = async (exchange, coin) =>
    (await getBalance(exchange, coin)) * await (getUSDValue(coin))

const getUSDValue = async coin =>
    (await axios.get(`${USDAPI}${coin}&tsyms=USD`)).data.USD

const getBalance = async (exchange, coin) =>
    parseFloat((await exchange.fetchBalance())['total'][coin])

const getAskPrice = async (exchange, pair) =>
    (await exchange.fetchTicker(pair)).ask

const cancelExpiredOrders = async (exchange, pair) => {
    const now = new Date().getTime() // unix timestamps with milliseconds
    flow(
        filter(o => (o.timestamp - now) > (60 * 1000) ),
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

module.exports = {
    getUSDBalance: getUSDBalance,
    getBalance: getBalance,
    getCoin: getCoin,
    getAskPrice: getAskPrice,
    cancelAllOrders: cancelAllOrders,
    cancelExpiredOrders: cancelExpiredOrders,
    getCurrency: getCurrency
}
