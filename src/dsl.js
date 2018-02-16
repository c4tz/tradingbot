const error                                     = require ('./error.js')
const { ticker }                                = require ('./ticker.js')
const { getUSDTBalance, getBalance, getCoin }   = require ('./common.js')
const { includes }                              = require ('lodash/fp')

const fullPrice = (sellOrderPrice, dsl) =>
    (sellOrderPrice/(100-dsl))*100

const run = async (exchange, pair, price, volume, dsl) => {
    const coin = getCoin(pair)
    const coinBalance = getBalance(exchange, coin)
    const usdtBalance = getUSDTBalance(exchange, coin, coinBalance)

    if (usdtBalance > 1) { // we probably still want to sell
        const openOrders = await exchange.fetchOpenOrders (symbol = pair)
        const currentPrice = (await exchange.fetchTicker(pair))['bid']
        if (!openOrders) {
            const sellPrice = price - ((price / 100) * dsl)
            await exchange.createLimitSellOrder(pair, coinBalance, sellPrice)
        }
        else {
            openOrders.map( order => {
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
                const sellPrice = currentPrice - ((currentPrice / 100) * dsl)
                await exchange.createLimitSellOrder(pair, coinBalance, sellPrice)
            }
        }
        return true
    }
        return false // already sold, stop running
}

const dsl = async (exchange, pair, price, volume, dsl, tickrate) => {
    ticker(tickrate, run, exchange, pair, price, volume, dsl)
}

module.exports = {
    dsl: dsl
}
