function logError(err) {
    console.error(err)
    process.exit(1)
}

process.on('uncaughtException', logError)
process.on('unhandledRejection', logError)