import express from 'express'
import {
  sendEmailValidation,
  validation,
  verifyEmail,
} from '../middleware/expressValidator.js'
import auth from '../express-handlers/auth.js'

const router = express.Router()

router.post('/sendEmail', sendEmailValidation, validation, auth.sendEmail)
router.post(
  '/verifyEmail',
  verifyEmail,
  validation,
  auth.verifyEmailRegistration
)

export default router
