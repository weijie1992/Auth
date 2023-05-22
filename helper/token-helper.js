import jwt from 'jsonwebtoken'
import jose from 'node-jose'
import { UnAuthorizeError, BadRequest } from '../utils/custom-errors.js'
import errorHelper from './error-helper.js'

const generateJwe = async (jwsPayload, jwsSecret, signOptions) => {
  try {
    /*Company source code below
  	// 1) sign the JWT token using RSA -> Asymmetric
    // 2) Extract header and payload
    // 3) Extract signature
    // 4) Extract Public Key
    // 5) Encrypt header and payload with public key using compact format, compact means that it will return a string rather than an object.
    // 6) Return both JWE as well as Signature
    const privateKey = process.env.JWT_PRIVATE_KEY
    const jwtToken = jwt.sign(payload, privateKey, signOptions)
    const jwtHeaderPayload = jwtToken.split('.').slice(0, 2).join('.')
    const jwtSignature = jwtToken.split('.')[2]
    const jwkPublicKey = await jose.JWK.asKey(process.env.JWE_PUBLIC_KEY, 'pem')
    const encryptedJWTHeaderPayload = await jose.JWE.createEncrypt({
      format: 'compact',
      jwkPublicKey,
    })
      .update(jwtHeaderPayload)
      .final()

    return { encryptedJWTHeaderPayload, jwtSignature }
    */

    //1) JWS on JWT token using HS256 which is symmetric
    //2) Extract public key as pem format
    //3) encrypt jweToken
    const jwsToken = jwt.sign(jwsPayload, jwsSecret, signOptions)
    const jwePublicKey = await jose.JWK.asKey(process.env.JWE_PUBLIC_KEY, 'pem')
    const jweToken = await jose.JWE.createEncrypt(
      { format: 'compact' },
      jwePublicKey
    )
      .update(jwsToken)
      .final()
    return jweToken
  } catch (err) {
    errorHelper(err)
  }
}

const verifyJwe = async (jweToken, jwsSecret) => {
  console.log('🚀 ~ file: token-helper.js:48 ~ verifyJwe ~ jweToken:', jweToken)
  console.log(
    "🚀 ~ file: token-helper.js:50 ~ verifyJwe ~ jweToken === 'undefined':",
    jweToken === 'undefined'
  )
  if (jweToken === 'undefined') {
    new UnAuthorizeError('JWE Token not provided')
  }
  //1) extract private key as pem format
  //2) decrypt the JWE payload
  //3) verify the JWS token
  try {
    const jwePrivateKey = await jose.JWK.asKey(
      process.env.JWE_PRIVATE_KEY,
      'pem'
    )
    const decryptedJWE = await jose.JWE.createDecrypt(jwePrivateKey).decrypt(
      jweToken
    )
    const plaintextToStr = decryptedJWE.plaintext.toString('utf8')
    const verifiedPayload = jwt.verify(plaintextToStr, jwsSecret)
    return verifiedPayload
  } catch (err) {
    console.log('🚀 ~ file: token-helper.js:63 ~ verifyJwe ~ err:', err)
    throw new UnAuthorizeError(err)
  }
}

export default { generateJwe, verifyJwe }
