const art  = require ('ascii-art')

const fancyText = (fancy, normal) => {
    art.font(fancy, 'Doom', 'green', (r) =>
        console.log("\n", r, "\n", normal))
}

const status = exchange => {
    exchange.fetchBalance().then( res => fancyText("Balances", res))
    exchange.fetchOpenOrders().then( res => fancyText("Open Orders", res))
}

module.exports = {
    status: status
}
