import express from 'express'
import {
  emailRegistrationValidation,
  validation,
  verifyEmail,
  loginByEmail,
} from '../middleware/expressValidator.js'
import auth from '../express-handlers/auth.js'

const router = express.Router()

router.post(
  '/emailRegistration',
  emailRegistrationValidation,
  validation,
  auth.emailRegistration
)
router.post(
  '/verifyEmail',
  verifyEmail,
  validation,
  auth.verifyEmailRegistration
)

router.post('/login', loginByEmail, validation, auth.loginByEmail)

export default router
