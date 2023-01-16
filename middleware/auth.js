import jwt from 'jsonwebtoken'
import { AuthorizeError } from '../utils/custom-errors.js'
import errorHelper from '../helper/error-helper.js'

const verifyJwt = (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader) {
    throw new AuthorizeError('User not authorized')
  }
  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    throw new AuthorizeError('User not authorized')
  }
  const decoded = jwt.verify(token, process.env.JWT_REGISTER)
  req.email = decoded.email
  next()
  try {
  } catch (err) {
    errorHelper(err)
  }
}

export { verifyJwt }
