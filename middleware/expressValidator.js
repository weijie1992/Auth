import expressValidator from 'express-validator'
import { ValidationError } from '../utils/custom-errors.js'
const { check, validationResult } = expressValidator

const emailRegistrationValidation = [
  check('fullName')
    .notEmpty()
    .isLength({ min: 2, max: 64 })
    .withMessage('Username must be between 2 to 64 characters'),
  check('email').isEmail().withMessage('Invalid Email'),
  check('password', 'Password lenght must be greater than 8')
    .notEmpty()
    .isLength({ min: 8, max: 64 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/
    )
    .withMessage(
      'Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character'
    ),
]

const loginByEmail = [
  check('email').isEmail().withMessage('Invalid Email'),
  check('password', 'Password lenght must be greater than 8')
    .notEmpty()
    .isLength({ min: 8, max: 64 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/
    )
    .withMessage(
      'Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character'
    ),
]

const validation = (req, _res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    throw new ValidationError(
      (error.errors && error.errors[0].msg) || 'MUST BE A VALID EMAIL'
    )
  }
  next()
}

export { emailRegistrationValidation, validation, loginByEmail }
