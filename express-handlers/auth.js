import authService from '../services/auth-service.js'
const emailRegistration = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body
    const results = await authService.constructJWTandSendEmail(
      fullName,
      email,
      password
    )
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const activateEmail = async (req, res, next) => {
  //todo activate email check JWT token expiry, set to 7 days when email link was clicked
  try {
    const results = await authService.activateEmail(req.email)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const loginByEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const results = await authService.verifyLogin(email, password)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}
export default { emailRegistration, activateEmail, loginByEmail }
