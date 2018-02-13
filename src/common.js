function getUSDTBalance(exchange, coin, balance = false) {
    if (!balance)
        balance = getBalance(exchange, coin)
    if (coin != 'USDT') {
        usdtPrice = exchange.fetchTicker(coin+'/USDT')['bid']
        balance = balance * usdtPrice
    }
    return balance
}

function getBalance(exchange, coin) {
    return parseFloat(exchange.fetchBalance()['total'][coin])
}

function getCoin(pair) {
    return split('/')(pair)[0]
}

function getCurrency(pair) {
    return split('/')(pair)[1]
}

module.exports = {
    getUSDTBalance: getUSDTBalance,
    getBalance: getBalance,
    getCoin: getCoin,
    getCurrency: getCurrency
}