const error                                         = require ('./error.js')
const { ticker }                                    = require ('./ticker.js')
const { trade }                                     = require ('./trade.js')
const { getUSDBalance, getBalance,
        getCoin, getMarket, getPrecisionAmount }    = require ('./common.js')
const { includes, isEmpty }                         = require ('lodash/fp')
const chalk                                         = require('chalk')

const fullPrice = (sellOrderPrice, dsl) =>
    (sellOrderPrice/(100-dsl))*100

const getLastBuyOrderTimestamp = function(orders) {
    lastOrder = {}
    lastOrderTimestamp = 0
    orders.map(order => {
        if (order.side == 'buy' && order.timestamp > lastOrderTimestamp)
            lastOrderTimestamp = order.timestamp
    })
    if (lastOrderTimestamp && lastOrderTimestamp > 0) {
        return lastOrderTimestamp
    } else {
        throw "No buy order found in history."
    }
}

const getLiveCandles = async (exchange, pair, timestamp) => {
    const ccxt = require ('ccxt')
    exchange_live = new ccxt[exchange.id]()
    candles = await exchange_live.fetchOHLCV(pair, '1h', timestamp)
    if (candles == null || candles == undefined || isEmpty(candles))
        throw "Couldn't fetch OHLCV data from live exchange."
    return candles
}

const getHigh = async (exchange, pair, timestamp, params) => {
    candles = null
    if (exchange.has['fetchOHLCV']) {
        candles = await exchange.fetchOHLCV(pair, '1h', timestamp)
    } else {
        throw "Exchange has no 'fetchOHLCV' method."
    }
    if (candles == null || candles == undefined || isEmpty(candles)) {
        if (params.debug) {
            candles = await getLiveCandles(exchange, pair, timestamp)
        } else {
            throw "Couldn't fetch OHLCV data from exchange."
        }
    }
    high = 0
    candles.map(candle => {
        // see: https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts
        candle.high = candle[2] 
        if (candle.high > high)
            high = candle.high
    })
    return high
}

const dsl = async (params) => {
    const { exchange, pair, dsl } = params
    const coin = getCoin(pair)
    const coinBalance = await getBalance(exchange, coin)
    const usdBalance =  await getUSDBalance(exchange, coin)
    const orders = await exchange.fetchClosedOrders(pair)
    if (!isEmpty(orders) && usdBalance > 1) {
        const lastOrderTime = getLastBuyOrderTimestamp(orders)
        const high = await getHigh(exchange, pair, lastOrderTime, params)
        const currentPrice = (await exchange.fetchTicker(pair))['bid']
        const stopLoss = high - ((high / 100) * dsl)
        console.log(chalk.blue(
            "Current price:", currentPrice,
            "| Stop loss limit:", stopLoss
        ))
        if (currentPrice <= stopLoss) {
            console.log(chalk.bgRed('Stop loss reached!'))
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
