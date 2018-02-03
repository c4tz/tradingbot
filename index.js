function logError(err) {
    console.error(err)
    process.exit(1)
}

process.on('uncaughtException', logError)
process.on('unhandledRejection', logError)

const { exchange, pair, dsl, tickrate }   = require('./src/arguments.js')
const sleep                               = require('sleep').sleep

const main = async () => {
    console.log(exchange, pair, dsl, tickrate)
}

const timer = async (tickrate) => {
    if (tickrate < 5) throw "Tickrate is too fast"
    main()
    await sleep(tickrate) // Tick every N seconds
    timer(tickrate)
}

timer(tickrate)
