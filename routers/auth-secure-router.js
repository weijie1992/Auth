import express from 'express'
import {
  sendEmailValidation,
  validation,
} from '../middleware/expressValidator.js'

const router = express.Router()

router.get('/sendEmail', sendEmailValidation, validation, (req, res) => {
  return res.send('Auth Router')
})

export default router
