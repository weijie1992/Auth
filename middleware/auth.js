import { UnAuthorizeError } from '../utils/custom-errors.js'
import tokenHelper from '../helper/token-helper.js'

const verifyLoginToken = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    throw new UnAuthorizeError('User not authorized')
  }
  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    throw new UnAuthorizeError('User not authorized')
  }
  try {
    const decoded = await tokenHelper.verifyJwe(
      token,
      process.env.LOGIN_HS256_SECRET
    )
    req.userId = decoded._id
    req.email = decoded.email
    next()
  } catch (err) {
    next(err)
  }
}

export { verifyLoginToken }
