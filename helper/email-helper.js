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
  const msg = {
    to: email,
    from: 'weijie_phua@outlook.com',
    subject: 'Complete your registration',
    text: `http://localhost:3000?token=${token}`,
    html: `
              <h1>Click the URL below to activate your Fruittier Account</h1>
              <p>This activate URL only last for 7days</p>
              <p>http://localhost/user/activate/${token}</p>
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
