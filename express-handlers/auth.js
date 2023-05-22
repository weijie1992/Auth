import constant from '../constant/constant.js'
import authService from '../services/auth-service.js'
const emailRegistration = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body
    const results = await authService.constructJWTandSendEmail(
      { fullName, email, password },
      res
    )
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const activateEmail = async (req, res, next) => {
  try {
    const token = req.body.token
    const results = await authService.activateEmail(token)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const loginByEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const results = await authService.verifyLogin({ email, password }, res)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const userAuthCheck = async (req, res, next) => {
  try {
    const results = await authService.routeCheck(req)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const adminAuthCheck = async (req, res, next) => {
  try {
    const results = await authService.routeCheckAdmin(req, constant.ADMIN)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const results = await authService.logout(req, res)
    console.log('🚀 ~ file: auth.js:57 ~ logout ~ results:', results)
    return res.json(results)
  } catch (err) {
    console.log('🚀 ~ file: auth.js:60 ~ logout ~ err:', err)
    next(err)
  }
}
const checkLogin = async (req, res, next) => {
  try {
    const results = await authService.checkLogin(req, res)
    console.log("🚀 ~ file: auth.js:67 ~ checkLogin ~ results:", results)
    return res.json(results)
  } catch (err) {
    next(err)
  }
}

export default {
  emailRegistration,
  activateEmail,
  loginByEmail,
  userAuthCheck,
  adminAuthCheck,
  logout,
  checkLogin,
}
