import expressValidator from 'express-validator'

const { check, validationResult } = expressValidator

const sendEmailValidation = check('email')
  .isEmail()
  .withMessage('MUST BE A VALID EMAIL')

const validation = (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() })
  }
  next()
}

export { sendEmailValidation, validation }
