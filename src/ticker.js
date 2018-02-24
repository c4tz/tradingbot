const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const ticker = async (tickrate, callback, params) => {
    if (await callback(params)) {
        await sleep(tickrate * 1000)
        ticker(tickrate, callback, params)
    }
}

module.exports = {
    ticker: ticker
}
