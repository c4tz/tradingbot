const getUSDTBalance = (exchange, coin, balance = false) => {
    if (!balance)
        balance = getBalance(exchange, coin)
    if (coin != 'USDT') {
        usdtPrice = exchange.fetchTicker(coin+'/USDT')['bid']
        balance = balance * usdtPrice
    }
    return balance
}

const getBalance = (exchange, coin) =>
    parseFloat(exchange.fetchBalance()['total'][coin])

const getCoin = pair => split('/')(pair)[0]

const getCurrency = pair => split('/')(pair)[1]

module.exports = {
    getUSDTBalance: getUSDTBalance,
    getBalance: getBalance,
    getCoin: getCoin,
    getCurrency: getCurrency
}
