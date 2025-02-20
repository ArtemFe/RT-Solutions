const Router = require('express')
const router = new Router()
const controller = require('./authController')

router.post('/reg', controller.reg)
router.post('/log', controller.log)
router.get('/users', controller.getUsers)

module.exports = router