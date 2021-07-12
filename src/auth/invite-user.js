import Adapters from 'next-auth/adapters'
import Models from './models'
import { randomBytes } from 'crypto'
import parseUrl from '../../node_modules/next-auth/dist/lib/parse-url.js'
import Providers from 'next-auth/providers'
import nodemailer from 'nodemailer'
import log from '../../lib/log'

// Email HTML body
const html = ({ url, email }) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
  // Some simple styling options
  const backgroundColor = '#1f1f1f'
  const textColor = '#ffffff'
  const mainBackgroundColor = '#4c4c4c'
  const buttonBackgroundColor = '#d521d5'
  const buttonBorderColor = '#ffffff'
  const buttonTextColor = '#ffffff'
  // Uses tables for layout and inline CSS due to email client limitations
  return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>Welcome to Palmoil.io</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        This email <strong>${escapedEmail}</strong> was invited to Palmoil.io. Use your email address each time you login.
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Get Started</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Or copy this link into your browser: <a target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; ">${url}</a> 
      </td>
    </tr>
     <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Need help? Reply to this email, or contact us at <a href="mailto:support@maphubs.com" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; ">support@maphubs.com</a>
      </td>
    </tr>

  </table>
</body>
`
}

// Email text body – fallback for email clients that don't render HTML
const text = ({ url, site }) => `Welcome to ${site}\n${url}\n\n`

const provider = Providers.Email({
  server: {
    service: 'SES-US-EAST-1',
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    }
  },
  from: 'Palmoil.io <info@maphubs.com>',
  maxAge: 24 * 60 * 60 * 60,
  // 24 hours/day * 60 minutes/hour * 60 seconds/minute * 60 days =  60 days in seconds
  sendVerificationRequest: ({
    identifier: email,
    url,
    token,
    baseUrl,
    provider
  }) => {
    return new Promise((resolve, reject) => {
      const { server, from } = provider
      // Strip protocol from URL and use domain as site name
      const site = 'Palmoil.io'
      url = url.replace(
        '/dashboard/api/auth/callback/email',
        '/dashboard/verify-email'
      )
      nodemailer.createTransport(server).sendMail(
        {
          to: email,
          from,
          subject: `Welcome to ${site}`,
          text: text({
            url,
            site,
            email
          }),
          html: html({
            url,
            site,
            email
          })
        },
        (error) => {
          if (error) {
            log.error(`Error sending invite email to: ${email}`)
            return reject(new Error(error))
          }

          return resolve()
        }
      )
    })
  }
})
const adapter = Adapters.TypeORM.Adapter(
  `${process.env.DB_CONNECTION}?entityPrefix=nextauth_`,
  {
    models: {
      User: Models.User
    }
  }
)

const inviteUser = async (email, name) => {
  const adapterInstance = await adapter.getAdapter({
    logger: {
      debug: (val) => {
        log.debug(val)
      },
      error: (val) => {
        log.error(val)
      },
      warn: (val) => {
        log.warn(val)
      }
    }
  })
  const { createUser, getUserByEmail, createVerificationRequest } =
    adapterInstance
  // check if the user already exists
  const userByEmail = email ? await getUserByEmail(email) : null

  if (userByEmail) {
    throw new Error('A user with this email already exists')
  } else {
    // create the user
    const currentDate = new Date()
    const user = await createUser({
      name,
      email,
      emailVerified: currentDate
    })
    log.info('new user created')
    log.info(user)
    // send an invite email
    // Prefer provider specific secret, but use default secret if none specified
    const secret = provider.secret || process.env.SESSION_SECRET
    // Generate token
    const token =
      provider.generateVerificationToken?.() ?? randomBytes(32).toString('hex')
    const { basePath, baseUrl } = parseUrl(process.env.NEXTAUTH_URL)
    // Send email with link containing token (the unhashed version)
    const url = `${baseUrl}${basePath}/callback/${encodeURIComponent(
      provider.id
    )}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
      token
    )}&callbackUrl=${encodeURIComponent(`${baseUrl}/dashboard`)}`
    return createVerificationRequest(email, url, token, secret, provider)
  }
}

export default inviteUser
