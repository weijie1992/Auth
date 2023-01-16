import express from 'express'
import {
  emailRegistrationValidation,
  validation,
  loginByEmail,
} from '../middleware/expressValidator.js'
import { verifyJwt } from '../middleware/auth.js'
import auth from '../express-handlers/auth.js'

const router = express.Router()

router.post(
  '/emailRegistration',
  emailRegistrationValidation,
  validation,
  auth.emailRegistration
)
router.post('/activateEmail', verifyJwt, auth.activateEmail)

router.post('/login', loginByEmail, validation, auth.loginByEmail)

export default router
