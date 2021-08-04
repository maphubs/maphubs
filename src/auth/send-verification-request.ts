import nodemailer from 'nodemailer'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

// Email HTML body
const html = ({ url, email }) => {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, '&#8203;.')}`
  // Some simple styling options
  const backgroundColor = '#fff'
  const textColor = '#212121'
  const mainBackgroundColor = '#fff'
  const buttonBackgroundColor = '#212121'
  const buttonBorderColor = '#212121'
  const buttonTextColor = '#fff'
  // Uses tables for layout and inline CSS due to email client limitations
  return `
<body style="background: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>MapHubs Login</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        Login as <strong>${escapedEmail}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Login</a></td>
          </tr>
        </table>
      </td>
    </tr>
     <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #212121;">
        Or copy this link into your browser: <a target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #212121; ">${url}</a> 
      </td>
    </tr>
     <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #212121;">
        Need help? Reply to this email, or contact us at <a href="mailto:support@maphubs.com" target="_blank" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; ">support@maphubs.com</a>
      </td>
    </tr>
  </table>
</body>
`
}

// Email text body – fallback for email clients that don't render HTML
const text = ({ url }) => `Login to MapHubs\n${url}\n\n`

const sendVerificationRequest = ({
  identifier: email,
  url,
  provider
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const { server, from } = provider
    // Strip protocol from URL and use domain as site name
    const site = process.env.NEXT_PUBLIC_PRODUCT_NAME
    url = url.replace('/api/auth/callback/email', '/verify-email')
    nodemailer.createTransport(server).sendMail(
      {
        to: email,
        from,
        subject: `Login to ${site}`,
        text: text({
          url
        }),
        html: html({
          url,
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

export default sendVerificationRequest
