const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const ticker = async (tickrate, callback, ...params) => {
    callback(...params)
    await sleep(tickrate * 1000) // Tick every N seconds
    ticker(tickrate, callback, ...params)
}

module.exports = {
    ticker: ticker
}