import jwt from 'jsonwebtoken'
import { UnAuthorizeError } from '../utils/custom-errors.js'
import errorHelper from '../helper/error-helper.js'

const verifyLoginToken = (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    throw new UnAuthorizeError('User not authorized')
  }
  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    throw new UnAuthorizeError('User not authorized')
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_LOGIN)
    req.userId = decoded._id
    req.email = decoded.email
    next()
  } catch (err) {
    errorHelper(err)
  }
}

export { verifyLoginToken }
