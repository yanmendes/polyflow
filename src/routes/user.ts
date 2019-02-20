import * as express from 'express'
const router = express.Router()

router.post('/authenticate', async (_, res) => {
  return res.send({
    success: true
  })
})

export default router
