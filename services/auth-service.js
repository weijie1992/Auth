import jwt from 'jsonwebtoken'
import passwordHelper from '../helper/password-helper.js'
import { UncaughtError, ValidationError } from '../utils/custom-errors.js'
import errorHelper from '../helper/error-helper.js'
import emailHelper from '../helper/email-helper.js'
import userRepository from '../database/repository/user-repository.js'

const constructJWTandSendEmail = async (fullName, email, password) => {
  if (!fullName || !email || !password) {
    throw new ValidationError('Please fill in all fields')
  }
  try {
    const user = await userRepository.findOne(email)
    if (user) {
      throw new ValidationError('User already has an account')
    }
    const token = jwt.sign({ email }, process.env.JWT_REGISTER, {
      expiresIn: process.env.JWT_REGISTER_TOKEN_EXPIRY_TIME,
    })
    await emailHelper.sendEmail(email, token)
    const hashedPassword = await passwordHelper.hashPassword(password)
    const results = await userRepository.save({
      fullName,
      email,
      password: hashedPassword,
    })
    if (results && results.email === email) {
      return {
        success: true,
        token,
      }
    }
    throw new UncaughtError('Something went wrong please contact administrator')
  } catch (err) {
    errorHelper(err)
  }
}

const activateEmail = async (token) => {
  try {
    const { email } = jwt.verify(token, process.env.JWT_REGISTER)
    const results = await userRepository.activateEmail(email)
    if (!results) {
      throw new ValidationError('User not found, Please try to register again')
    }
    return {
      success: true,
    }
  } catch (err) {
    errorHelper(err)
  }
}

const createUserWithPassword = async (username, password, token) => {
  if (!username || !password || !token) {
    throw new ValidationError('Username/Password/Token was no provided')
  }
  try {
    const { email } = jwt.verify(token, process.env.JWT_REGISTER)
    const hashedPassword = await passwordHelper.hashPassword(password)
    const results = await userRepository.save({
      email,
      username,
      password: hashedPassword,
    })
    if (results && results.email === email) {
      return {
        success: true,
      }
    }
  } catch (err) {
    errorHelper(err)
  }
}

const verifyLogin = async (email, password) => {
  if (!email || !password) {
    throw new ValidationError('Email or Password was not provided')
  }
  try {
    const user = await userRepository.findOne(email)
    if (!user) {
      throw new ValidationError('User not exist, please register')
    }
    const hashedPassword = user.password
    const res = await passwordHelper.comparePassword(password, hashedPassword)
    if (!res) {
      throw new ValidationError('Email and Password dont match')
    }
    const token = jwt.sign({ email }, process.env.JWT_LOGIN, {
      expiresIn: process.env.JWT_LOGIN_TOKEN_EXPIRY_TIME,
    })
    return {
      success: true,
      token,
    }
  } catch (err) {
    errorHelper(err)
  }
}
export default {
  constructJWTandSendEmail,
  activateEmail,
  createUserWithPassword,
  verifyLogin,
}
