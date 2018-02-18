const { includes }   = require('lodash/fp')
const ccxt           = require ('ccxt')
const validator = require('validator')

const validationError = (param, lower, upper) => `Invalid value for ${param} parameter: Value should be between ${lower} and ${upper}`

const check = (param, str, min, max) => {
    if (!validator.isInt(param.toString(), { min: min, max: max }))
        throw validationError(str, min, max)
}

const validate = param => {
    if (!includes(param.exchange)(ccxt.exchanges))
        throw `Exchange ${params.exchange} is not supported.`

    if (!includes('/')(param.pair))
        throw 'Pair must be of ABC/XYZ format.'

    if (!process.env.API_KEY || !process.env.SECRET)
        throw 'Please set API_KEY and SECRET env variables.'

    if (param.volume)
        check(param.volume, "volume", 1, 100)

    if (param.tickrate)
        check(param.tickrate, "tickrate", 5, 600)

    if (param.dsl)
        check(param.dsl, "dsl", 1, 10)

    if (!process.env.API_KEY || !process.env.SECRET)
        throw 'Please set API_KEY and SECRET env variables.'
}

module.exports = {
    validate: validate
}
