const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const ticker = async (tickrate, callback, ...params) => {
    callback(...params).then(function(result) {
        if (result) {
            sleep(tickrate * 1000).then(function(result) {
                ticker(tickrate, callback, ...params)
            })
        }
    })
}

module.exports = {
    ticker: ticker
}