import express from 'express'
import expressValidator from 'express-validator'

const { body, validationResult } = expressValidator
const router = express.Router()

router.get('/sendEmail', body('email').isEmail(), (req, res) => {
  const errors = validationResult(req)
  console.log("🚀 ~ file: auth-secure-router.js:9 ~ router.get ~ errors", errors)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return res.send('Auth Router')
  //
})

export default router
