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

    const loginToken = await tokenHelper.generateJwe(
      { _id: user._id, email, role: user.role },
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
    let user
    
    if (req._id) {
      user = await userRepository.findById(req.userId)
    } else {
      user = await userRepository.findOne(req.email)
    }
    if (!user || !user.email || !user.role) {
      throw new UnAuthorizeError('User not found')
    }
    if (user.email === req.email && user.role === role) {
      return {
        success: true,
        redirect: user.role,
      }
    }
    throw new ForbiddenError('Access to page denied')
  } catch (err) {
    errorHelper(err)
  }
}

export default {
  constructJWTandSendEmail,
  activateEmail,
  verifyLogin,
  routeCheck,
  routeCheckAdmin,
}
