import jwt from 'jsonwebtoken'
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

const constructJWTandSendEmail = async (fullName, email, password) => {
  if (!fullName || !email || !password) {
    throw new BadRequest('Please fill in all fields')
  }
  try {
    const user = await userRepository.findOne(email)
    if (user) {
      throw new BadRequest('User already has an account')
    }
    const loginToken = jwt.sign({ email }, process.env.JWT_LOGIN, {
      expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
    })

    const hashedPassword = await passwordHelper.hashPassword(password)

    const results = await userRepository.save({
      fullName,
      email,
      password: hashedPassword,
    })

    const token = jwt.sign({ email }, process.env.JWT_REGISTER, {
      expiresIn: process.env.JWT_REGISTER_TOKEN_EXPIRY_TIME,
    })
    await emailHelper.sendEmail(email, token)

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
    const { email } = jwt.verify(token, process.env.JWT_REGISTER)
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

const verifyLogin = async (email, password) => {
  if (!email || !password) {
    throw new BadRequest('Email or Password was not provided')
  }
  try {
    const user = await userRepository.findOne(email)
    if (!user) {
      throw new BadRequest('User not exist, please register')
    }
    const hashedPassword = user.password
    const res = await passwordHelper.comparePassword(password, hashedPassword)
    if (!res) {
      throw new BadRequest('Email and Password dont match')
    }
    const token = jwt.sign(
      { _id: user._id, email, role: user.role },
      process.env.JWT_LOGIN,
      {
        expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
      }
    )
    return {
      success: true,
      token,
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
