import express from 'express'
const router = express.Router()

router.post('/authenticate', async (req, res, next) => {
  res.send({
    success: true
  })
})

export default router
