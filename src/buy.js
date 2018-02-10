const error                     = require ('./error.js')
const { ticker }                = require ('./ticker.js')
const ccxt                      = require ('ccxt')
const { map, isNil, split }     = require('lodash/fp')

function fullPrice(sellOrderPrice, dsl) {
    return (sellOrderPrice/(100-dsl))*100
}

const trade = async (exchange, pair, price, volume, dsl) => {
    openOrders = await exchange.fetchOpenOrders (symbol = pair)
    coin = split('/')(pair)[0]
    coinBalance = parseFloat(
        (await exchange.fetchBalance())['total'][coin]
    )
    currency = split('/')(pair)[1]
    currencyBalance = parseFloat(
        (await exchange.fetchBalance())['total'][currency]
    )
    if (coin != 'USDT')
        usdtPrice = (await exchange.fetchTicker(coin+'/USDT'))['bid']
        usdtBalance = coinBalance * usdtPrice
    usdtBalance = 2
    if (usdtBalance < 1 && !openOrders) {// we probably did not buy the coin yet
        amount = (currencyBalance / 100) * volume
        order = await exchange.createLimitBuyOrder (pair, amount, price)
    }
    else if (usdtBalance > 1) { // we already bought our desired coin
        // Dynamic Stop Loss
        currentPrice = (await exchange.fetchTicker(pair))['bid']
        if (!openOrders) {
            sellPrice = price - ((price / 100) * dsl)
        }
        else {
            openOrders.map(function(order) {
                if (order.side == 'sell') {
                    if (!lastPrice ||
                    (lastPrice && lastPrice > fullPrice(order.price, dsl))) {
                        lastPrice = fullPrice(order.price, dsl)
                    }  
                    await exchange.cancelOrder(order.id)
                }
            })
            if (lastPrice < currentPrice)
                sellPrice = currentPrice - ((currentPrice / 100) * dsl)
        }
        await exchange.createLimitSellOrder(pair, coinBalance, sellPrice)
    }
}

const buy = async (exchange, pair, price, volume, dsl, tickrate) => {
    ticker(tickrate, trade, exchange, pair, price, volume, dsl)
}

module.exports = {
    buy: buy
}