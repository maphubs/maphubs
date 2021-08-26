import Providers from 'next-auth/providers'
import adapter from './adapter'
import { isMember, isMemberEmail } from './check-user'
import sendVerificationRequest from './send-verification-request'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

const config = {
  debug: true,
  providers: [
    // Passwordless / email sign in
    Providers.Email({
      server: {
        service: 'SES-US-EAST-1',
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: 'MapHubs <info@maphubs.com>',
      sendVerificationRequest
    })
  ],
  adapter,
  // @link https://next-auth.js.org/configuration/options#session
  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    jwt: true,
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60 // 30 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // @link https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // A secret to use for key generation - you should set this explicitly
    // Defaults to NextAuth.js secret if not explicitly specified.
    secret: process.env.SESSION_SECRET,
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY
    // Set to true to use encryption. Defaults to false (signing only).
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // @link https://next-auth.js.org/configuration/callbacks
  callbacks: {
    /**
     * Intercept signIn request and return true if the user is allowed.
     *
     * @link https://next-auth.js.org/configuration/callbacks#sign-in-callback
     * @param  {object} user     User object
     * @param  {object} account  Provider account
     * @param  {object} profile  Provider profile
     * @return {boolean}         Return `true` (or a modified JWT) to allow sign in
     *                           Return `false` to deny access
     */
    signIn: async (user, account, profile) => {
      if (!profile.verificationRequest) {
        // after the magic link is clicked
        log.info(`verification link clicked for user: ${user.id}`)
        const isAllowedToSignIn = await isMember(user)
        if (!isAllowedToSignIn) {
          log.warn('User is not allowed to sign in')
          console.warn(user)
        }
        return isAllowedToSignIn ? true : '/membership'
        // before email sent to user
      } else {
        // only sent to existing users
        const isExistingMember = await isMemberEmail(user.email)
        if (isExistingMember) {
          log.info(`Login requested for: ${user.email}`)
        } else {
          log.warn(`Login attempt for unknown user: ${user.email}`)
        }
        return isExistingMember ? true : '/api/auth/verify-request' // send guessed or non-member emails to the verification page so we won't reveal legit emails
      }
    },

    /**
     * @link https://next-auth.js.org/configuration/callbacks#session-callback
     * @param  {object} session      Session object
     * @param  {object} user         User object    (if using database sessions)
     *                               JSON Web Token (if not using database sessions)
     * @return {object}              Session that will be returned to the client
     */
    session: async (session, user) => {
      session.sub = user.sub
      session.role = user.role
      session.termsAccepted = user.termsAccepted
      return Promise.resolve(session)
    },

    /**
     * @link https://next-auth.js.org/configuration/callbacks#jwt-callback
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (only available on sign in)
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @param  {boolean} isNewUser True if new user (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */
    jwt: async (token, user, account, profile, isNewUser) => {
      //const isSignIn = (user) ? true : false
      // Add auth_time to token on signin in
      //if (isSignIn) { token.auth_time = Math.floor(Date.now() / 1000) }
      if (user?.role) {
        token.role = user.role
      }
      if (user?.termsAccepted) {
        token.termsAccepted = user.termsAccepted
      }
      return Promise.resolve(token)
    },

    async redirect() {
      return '/'
    }
  },

  events: {
    async signIn(message) {
      log.info(message)
    },
    async signOut(message) {
      log.info(message)
    },
    async createUser(message) {
      log.info(message)
    },
    async linkAccount(message) {
      log.info(message)
    },
    async session(message) {
      // log.info(message)
    },
    async error(message) {
      log.info('auth error: ' + message)
    }
  },

  logger: {
    error(code, ...message) {
      log.error(code, message)
    },
    warn(code, ...message) {
      log.warn(code, message)
    },
    debug(code, ...message) {
      log.debug(code, message)
    }
  },

  // You can define custom pages to override the built-in pages
  // The routes shown here are the default URLs that will be used.
  // @link https://next-auth.js.org/configuration/pages
  pages: {
    signIn: '/login',
    //signOut: '/api/auth/signout',
    error: '/auth-error', // Error code passed in query string as ?error=
    //verifyRequest: '/api/auth/verify-request' // (used for check email message)
    newUser: '/welcome'
  },

  // Additional options
  secret: process.env.SESSION_SECRET // Recommended (but auto-generated if not specified)
  // debug: true, // Use this option to enable debug messages in the console
}
export default config
