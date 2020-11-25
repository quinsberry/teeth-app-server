const { check } = require('express-validator')

const validation = {
  create: [
    check('fullName').isLength({ min: 5 }),
    check('phone').isLength({ min: 10 })
  ]
}

module.exports = validation