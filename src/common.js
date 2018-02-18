const axios = require('axios')
const { split, first, tail, flow }   = require('lodash/fp')

const USDAPI = `https://min-api.cryptocompare.com/data/price?fsym=`

const getUSDBalance = async (exchange, coin) =>
    (await getBalance(exchange, coin)) * await (getUSDValue(coin))

const getUSDValue = async coin =>
    (await axios.get(`${USDAPI}${coin}&tsyms=USD`)).data.USD

const getBalance = async (exchange, coin) =>
    parseFloat((await exchange.fetchBalance())['total'][coin])

const getCoin = pair => flow(split('/'), first)(pair)

const getCurrency = pair => flow(split('/'), tail, first)(pair)

module.exports = {
    getUSDBalance: getUSDBalance,
    getBalance: getBalance,
    getCoin: getCoin,
    getCurrency: getCurrency
}
