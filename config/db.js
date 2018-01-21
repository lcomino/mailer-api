const mongoose = require('mongoose')
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/api-mailer'

mongoose.Promise = global.Promise
mongoose.connect(dbURI)

mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection connected to ' + dbURI)
})

mongoose.connection.on('error', (err) => {
  console.log('Mongoose default connection err ' + err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connectios disconnected')
})

mongoose.connection.on('open', () => {
  console.log('Mongoose default connection is open')
})

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})

module.exports = mongoose
