import sgMail from '@sendgrid/mail'
import * as dotenv from 'dotenv'
import { APIError } from '../utils/custom-errors.js'

//DOT ENV
if (process.env.NODE_ENV !== 'PROD') {
  dotenv.config({ path: './.env' })
} else {
  dotenv.config()
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (email, token) => {
  const base64Token =btoa(token)
  const msg = {
    to: email,
    from: 'weijie_phua@outlook.com',
    subject: 'Complete your registration',
    html: `
              <p>Click <a href="${process.env.ACTIVATE_EMAIL_URL}${base64Token}">Here</a> to activate your account it only last for 7 days</p>
              
              <p>${process.env.ACTIVATE_EMAIL_URL}${base64Token}</p>
                  `,
  }
  try {
    await sgMail.send(msg)
    return true
  } catch (err) {
    throw new APIError(err)
  }
}
export default { sendEmail }
