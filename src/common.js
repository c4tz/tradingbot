const axios = require('axios')
const USDAPI = `https://min-api.cryptocompare.com/data/price?fsym=`

const getUSDBalance = (exchange, coin) =>
    getBalance(exchange, coin) * getUSDValue(coin)

const getUSDValue = async coin =>
    (await axios.get(`${USDAPI}${coin}&tsyms=USD`)).data.USD

const getBalance = (exchange, coin) =>
    parseFloat(exchange.fetchBalance()['total'][coin])

const getCoin = pair => split('/')(pair)[0]

const getCurrency = pair => split('/')(pair)[1]

module.exports = {
    getUSDBalance: getUSDBalance,
    getBalance: getBalance,
    getCoin: getCoin,
    getCurrency: getCurrency
}
