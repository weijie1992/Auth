import authService from '../services/auth-service.js'
const emailRegistration = async (req, res, next) => {
  try {
    const results = await authService.constructJWTandSendEmail(req.body.email)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const verifyEmailRegistration = async (req, res, next) => {
  const { username, password, token } = req.body
  try {
    const results = await authService.createUserWithPassword(
      username,
      password,
      token
    )
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
export default { emailRegistration, verifyEmailRegistration, loginByEmail }
