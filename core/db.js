const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://eugene:1q2w3e4r@cluster0-8acyg.mongodb.net/dental', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(function (err) {
  throw Error(err)
})

module.exports = mongoose