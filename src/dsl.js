const error                                     = require ('./error.js')
const { ticker }                                = require ('./ticker.js')
const { getUSDTBalance, getBalance, getCoin }   = require ('./common.js')
const { includes }                              = require ('lodash/fp')

function fullPrice(sellOrderPrice, dsl) {
    return (sellOrderPrice/(100-dsl))*100
}

const run = async (exchange, pair, price, volume, dsl) => {
    coin = getCoin(pair)
    coinBalance = getBalance(exchange, coin)
    usdtBalance = getUSDTBalance(exchange, coin, coinBalance)
    if (usdtBalance > 1) { // we probably still want to sell
        openOrders = await exchange.fetchOpenOrders (symbol = pair)
        currentPrice = (await exchange.fetchTicker(pair))['bid']
        if (!openOrders) {
            sellPrice = price - ((price / 100) * dsl)
            await exchange.createLimitSellOrder(pair, coinBalance, sellPrice)
        }
        else {
            openOrders.map(function(order) {
                if (order.side == 'sell') {
                    if (!lastPrice ||
                    (lastPrice && lastPrice > fullPrice(order.price, dsl))) {
                        lastPrice = fullPrice(order.price, dsl)
                    }
                    if (lastPrice < currentPrice) {
                        exchange.cancelOrder(order.id)     
                    }
                }
            })
            if (lastPrice < currentPrice) {
                sellPrice = currentPrice - ((currentPrice / 100) * dsl)
                await exchange.createLimitSellOrder(pair, coinBalance, sellPrice)
            }
        }
        return true
    }
    else {
        return false // already sold, stop running
    }
}

const dsl = async (exchange, pair, price, volume, dsl, tickrate) => {
    ticker(tickrate, run, exchange, pair, price, volume, dsl)
}

module.exports = {
    dsl: dsl
}