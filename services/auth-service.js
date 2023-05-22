import passwordHelper from '../helper/password-helper.js'
import {
  UnAuthorizeError,
  UncaughtError,
  BadRequest,
  ForbiddenError,
} from '../utils/custom-errors.js'
import errorHelper from '../helper/error-helper.js'
import emailHelper from '../helper/email-helper.js'
import userRepository from '../database/repository/user-repository.js'
import tokenHelper from '../helper/token-helper.js'
import constant from '../constant/constant.js'
import { redisClient } from '../redis/index.js'
import { nanoid } from 'nanoid'

export const sum = (a, b) => {
  return a+b
}
const constructJWTandSendEmail = async ({ fullName, email, password }, res) => {
  if (!fullName || !email || !password) {
    throw new BadRequest('Please fill in all fields')
  }
  try {
    const user = await userRepository.findOne(email)
    if (user) {
      throw new BadRequest('User already has an account')
    }

    const loginToken = await tokenHelper.generateJwe(
      { email },
      process.env.LOGIN_HS256_SECRET,
      {
        expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
        algorithm: process.env.JWT_SIGN_ALGORITHM,
      }
    )

    res.cookie(constant.LOGIN_TOKEN, loginToken, {
      // httpOnly: process.env.COOKIES_HTTPONLY,
      sameSite: process.env.COOKIES_SAMESITE,
      domain: process.env.COOKIES_DOMAIN,
      path: process.env.COOKIES_PATH,
      secure: false,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRES)),
    })

    const hashedPassword = await passwordHelper.hashPassword(password)
    const results = await userRepository.save({
      fullName,
      email,
      password: hashedPassword,
    })

    const emailToken = await tokenHelper.generateJwe(
      { email },
      process.env.REGISTER_HS256_SECRET,
      {
        expiresIn: '7d',
        algorithm: process.env.JWT_SIGN_ALGORITHM,
      }
    )
    await emailHelper.sendEmail(email, emailToken)

    if (results && results.email === email) {
      return {
        success: true,
        token: loginToken,
      }
    }

    throw new UncaughtError('Something went wrong please contact administrator')
  } catch (err) {
    errorHelper(err)
  }
}

const activateEmail = async (token) => {
  if (!token) {
    throw new UnAuthorizeError('Token Not Found')
  }
  try {
    const { email } = await tokenHelper.verifyJwe(
      token,
      process.env.REGISTER_HS256_SECRET
    )
    const results = await userRepository.activateEmail(email)
    if (!results) {
      throw new BadRequest('User not found, please register')
    }
    return {
      success: true,
    }
  } catch (err) {
    errorHelper(err)
  }
}

const verifyLogin = async ({ email, password }, res) => {
  if (!email || !password) {
    throw new BadRequest('Email or Password was not provided')
  }
  try {
    const user = await userRepository.findOne(email)
    if (!user) {
      throw new BadRequest('User not exist, please register')
    }
    const hashedPassword = user.password
    const results = await passwordHelper.comparePassword(
      password,
      hashedPassword
    )
    if (!results) {
      throw new BadRequest('Email and Password dont match')
    }

    const sessionid = nanoid()
    redisClient.setex(
      constant.REDIS_KEY_IAM_SESSION + email,
      process.env.SESSION_EXPIRY_TIME,
      sessionid
    )

    const loginToken = await tokenHelper.generateJwe(
      {
        _id: user._id,
        email,
        role: user.role,
        sessionid,
      },
      process.env.LOGIN_HS256_SECRET,
      {
        expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
        algorithm: process.env.JWT_SIGN_ALGORITHM,
      }
    )

    res.cookie(constant.LOGIN_TOKEN, loginToken, {
      // httpOnly: process.env.COOKIES_HTTPONLY,
      sameSite: process.env.COOKIES_SAMESITE,
      domain: process.env.COOKIES_DOMAIN,
      path: process.env.COOKIES_PATH,
      secure: false,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRES)),
    })

    return {
      success: true,
      token: loginToken,
      redirect: user.role,
    }
  } catch (err) {
    errorHelper(err)
  }
}

const routeCheck = async (req) => {
  try {
    let user
    if (req.userId) {
      user = await userRepository.findById(req.userId)
    } else {
      user = await userRepository.findOne(req.email)
    }
    if (!user || !user.email || !user.role) {
      throw new UnAuthorizeError('User not found')
    }
    if (user.email === req.email) {
      return {
        success: true,
        redirect: user.role,
      }
    }
    throw new UnAuthorizeError('UnAuthorize')
  } catch (err) {
    errorHelper(err)
  }
}

const routeCheckAdmin = async (req, role) => {
  try {
    const { userId, email } = req

    const user = await _checkUserExistInDb({ userId, email })
    if (user.role !== role) {
      throw new ForbiddenError('Access to page denied')
    }
    return {
      success: true,
      redirect: user.role,
    }

    // if (!email || !sessionid) {
    //   throw new UnAuthorizeError('User Session not found, Please Relogin')
    // }

    // if (!(await redisClient.get(constant.REDIS_KEY_IAM_SESSION + email))) {
    //   throw new UnAuthorizeError('Session Expired. Please Relogin')
    // }
    // if (
    //   (await redisClient.get(constant.REDIS_KEY_IAM_SESSION + email)) !==
    //   sessionid
    // ) {
    //   throw new UnAuthorizeError('Concurrent Session Detected. Please Relogin')
    // }

    // let user

    // if (userId) {
    //   user = await userRepository.findById(userId)
    // } else {
    //   user = await userRepository.findOne(email)
    // }

    // if (!user || !user.email || !user.role) {
    //   throw new UnAuthorizeError('User not found')
    // }

    // if (user.email === req.email && user.role === role) {
    //   return {
    //     success: true,
    //     redirect: user.role,
    //   }
    // }

    // throw new ForbiddenError('Access to page denied')
  } catch (err) {
    errorHelper(err)
  }
}
const logout = async (req, res) => {
  // throw new UnAuthorizeError('User Session not found, Please Relogin')
  const { email, sessionid } = req
  console.log('🚀 ~ file: auth-service.js:215 ~ logout ~ sessionid:', sessionid)
  console.log('🚀 ~ file: auth-service.js:215 ~ logout ~ email:', email)
  if (!email || !sessionid) {
    throw new UnAuthorizeError('User Session not found, Please Relogin')
  }
  try {
    if (
      (await redisClient.get(constant.REDIS_KEY_IAM_SESSION + email)) ===
      sessionid
    ) {
      await redisClient.del(constant.REDIS_KEY_IAM_SESSION + email)
      return {
        success: true,
      }
    }
    throw new UnAuthorizeError('User Session not found, logout failed')
  } catch (err) {
    errorHelper(err)
  } finally {
    res.clearCookie('login_token')
  }
}

const checkLogin = async (req, res) => {
  try {
    const { userId, email } = req
    const user = await _checkUserExistInDb({ userId, email })
    console.log('🚀 ~ file: auth-service.js:248 ~ checkLogin ~ user:', user)
    //if token expiring, renew here
    const expireDatetime = new Date(req.exp * 1000)
    console.log(
      '🚀 ~ file: auth-service.js:251 ~ checkLogin ~ expireDatetime:',
      expireDatetime
    )
    const now = new Date()
    console.log('🚀 ~ file: auth-service.js:253 ~ checkLogin ~ now:', now)
    const diffInMinutes = Math.floor((expireDatetime - now) / (1000 * 60))
    console.log(
      '🚀 ~ file: auth-service.js:255 ~ checkLogin ~ diffInMinutes:',
      diffInMinutes
    )
    if (diffInMinutes <= process.env.TIME_TO_RENEW_JWT_IN_MINUTES) {
      await redisClient.del(constant.REDIS_KEY_IAM_SESSION + email)

      const newSessionId = nanoid()
      redisClient.setex(
        constant.REDIS_KEY_IAM_SESSION + email,
        process.env.SESSION_EXPIRY_TIME,
        newSessionId
      )
      const newLoginToken = await tokenHelper.generateJwe(
        {
          _id: user._id,
          email,
          role: user.role,
          sessionid: newSessionId,
        },
        process.env.LOGIN_HS256_SECRET,
        {
          expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
          algorithm: process.env.JWT_SIGN_ALGORITHM,
        }
      )
      console.log(
        '🚀 ~ file: auth-service.js:278 ~ checkLogin ~ newLoginToken:',
        newLoginToken
      )

      res.cookie(constant.LOGIN_TOKEN, newLoginToken, {
        // httpOnly: process.env.COOKIES_HTTPONLY,
        sameSite: process.env.COOKIES_SAMESITE,
        domain: process.env.COOKIES_DOMAIN,
        path: process.env.COOKIES_PATH,
        secure: false,
        expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRES)),
      })

      return {
        success: true,
        token: newLoginToken,
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    console.log('🚀 ~ file: auth-service.js:255 ~ checkLogin ~ err:', err)
    errorHelper(err)
  }
}

const _checkUserExistInDb = async ({ userId, email }) => {
  let user
  if (userId) {
    user = await userRepository.findById(userId)
  } else {
    user = await userRepository.findOne(email)
  }

  _isValidUser({ user, email })
  return user
}

const _isValidUser = ({ user, email }) => {
  if (!user || !user.email || !user.role) {
    throw new UnAuthorizeError('User not found')
  }
  if (user.email !== email) {
    throw new UnAuthorizeError(
      'Something is wrong with user, please contact admin'
    )
  }
  return
}

export default {
  constructJWTandSendEmail,
  activateEmail,
  verifyLogin,
  routeCheck,
  routeCheckAdmin,
  logout,
  checkLogin,
}
