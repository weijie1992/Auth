import { UnAuthorizeError } from '../utils/custom-errors.js'
import tokenHelper from '../helper/token-helper.js'
import { redisClient } from '../redis/index.js'
import constant from '../constant/constant.js'

const verifyLoginToken = async (req, res, next) => {
  const authHeader = req.header('Authorization')
  console.log(
    '🚀 ~ file: auth.js:6 ~ verifyLoginToken ~ authHeader:',
    authHeader
  )

  if (!_hasAuthHeader(authHeader)) {
    _clearCookieAndThrowError({ res, next, errorMsg: 'User not authorized' })
    return
  }

  const token = authHeader.split('Bearer ')[1]
  if (!_hasBearerToken(token)) {
    _clearCookieAndThrowError({ res, next, errorMsg: 'User not authorized' })
    return
  }

  try {
    const { _id, email, sessionid, iat, exp } = await tokenHelper.verifyJwe(
      token,
      process.env.LOGIN_HS256_SECRET
    )

    if (!_isValidateJWTPayload({ _id, email, sessionid, iat, exp })) {
      _clearCookieAndThrowError({
        res,
        next,
        errorMsg: 'JWT payload error',
      })
      return
    }

    if (!(await _isSessionExist(email))) {
      _clearCookieAndThrowError({
        res,
        next,
        errorMsg: 'Session Expired. Please Relogin',
      })
      return
    }

    if (await _concurrentSessionExist({ email, sessionid })) {
      _clearCookieAndThrowError({
        res,
        next,
        errorMsg: 'Concurrent Session Detected. Please Relogin',
      })
      return
    }

    req.userId = _id
    req.email = email
    req.sessionid = sessionid
    req.iat = iat
    req.exp = exp
    next()
  } catch (err) {
    console.log('🚀 ~ file: auth.js:29 ~ verifyLoginToken ~ err:', err)
    res.clearCookie('login_token')
    next(err)
  }
}
const _clearCookieAndThrowError = ({ res, next, errorMsg }) => {
  console.log('🚀 ~ file: auth.js:74 ~ _clearCookieAndThrowError:')
  res.clearCookie('login_token')
  next(new UnAuthorizeError(errorMsg))
}
const _hasAuthHeader = (authHeader) => {
  if (!authHeader || authHeader === 'undefined') {
    return false
  }
  return true
}

const _hasBearerToken = (token) => {
  if (!token) {
    return false
  }
  return true
}

const _isValidateJWTPayload = ({ _id, email, sessionid, iat, exp }) => {
  if (!(_id && email && sessionid && iat && exp)) {
    return false
  }
  return true
}

const _isSessionExist = async (email) => {
  if (await redisClient.get(constant.REDIS_KEY_IAM_SESSION + email)) {
    return true
  }
  return false
}

const _concurrentSessionExist = async ({ email, sessionid }) => {
  if (
    (await redisClient.get(constant.REDIS_KEY_IAM_SESSION + email)) ===
    sessionid
  ) {
    return false
  }
  return true
}

export { verifyLoginToken }
