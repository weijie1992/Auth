import jwt from 'jsonwebtoken'
import passwordHelper from '../helper/password-helper.js'
import { ValidationError } from '../utils/custom-errors.js'
import errorHelper from '../helper/error-helper.js'
import emailHelper from '../helper/email-helper.js'
import userRepository from '../database/repository/user-repository.js'

const constructJWTandSendEmail = async (email) => {
  try {
    const user = await userRepository.findOne(email)
    if (user) {
      throw new ValidationError('User already has an account')
    }
    const token = jwt.sign({ email }, process.env.JWT_REGISTER, {
      expiresIn: process.env.JWT_REGISTER_TOKEN_EXPIRY_TIME,
    })
    const sendEmailResults = await emailHelper.sendEmail(email, token)
    return {
      success: sendEmailResults,
      token,
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

export default { constructJWTandSendEmail, createUserWithPassword }
