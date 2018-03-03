const error                                         = require ('./error.js')
const { ticker }                                    = require ('./ticker.js')
const { trade }                                     = require ('./trade.js')
const { getUSDBalance, getBalance,
        getCoin, getMarket, getPrecisionAmount }    = require ('./common.js')
const { includes, isEmpty }                         = require ('lodash/fp')

const fullPrice = (sellOrderPrice, dsl) =>
    (sellOrderPrice/(100-dsl))*100

const getLastBuyOrderTimestamp = function(orders) {
    lastOrder = {}
    lastOrderTimestamp = 0
    orders.map(order => {
        if (order.side == 'buy' && order.timestamp > lastOrderTimestamp)
            lastOrder = order
    })
    return lastOrder.timestamp
}

const dsl = async (params) => {
    const { exchange, pair, dsl } = params
    const coin = getCoin(pair)
    const coinBalance = await getBalance(exchange, coin)
    const usdBalance =  await getUSDBalance(exchange, coin)
    const orders = await exchange.fetchClosedOrders(pair)
    if (!isEmpty(orders) && usdBalance > 1) {
        const lastOrderTime = getLastBuyOrderTimestamp(orders)
        const candles = await exchange.fetchOHLCV(pair, '1h', lastOrderTime)
        high = 0
        candles.map(candle => {
            // see: https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts
            candle.high = candle[2] 
            if (candle.high > high)
                high = candle.high
        })
        const currentPrice = (await exchange.fetchTicker(pair))['bid']
        const stopLoss = high - ((high / 100) * dsl)
        if (currentPrice <= stopLoss) {
            params.bestprice = true
            params.amount = await getBalance(exchange, coin)
            params.sell = true
            const { trade } = require ('./trade.js')
            ticker(params.tickrate, trade, params)
            return false
        }
    }
    return true
}

module.exports = {
    dsl: dsl
}
