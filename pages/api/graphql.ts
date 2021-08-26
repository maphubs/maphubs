import { ApolloServer, gql } from 'apollo-server-micro'
import { isMember } from '../../src/auth/check-user'
import resolvers from '../../src/graphql/resolvers'
import { importSchema } from 'graphql-import'
import jwt from 'next-auth/jwt'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'

import type { NextApiHandler } from 'next'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY
let schema = ''
try {
  schema = importSchema('./src/graphql/schema.graphql')
} catch (err) {
  console.error('failed to init schema')
  console.error(err.message)
}
const typeDefs = gql`
  ${schema}
`
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const user = await jwt.getToken({
      req,
      signingKey
    })
    return {
      user
    }
  },
  formatError: (err) => {
    // send to Sentry
    log.error(err)

    if (
      process.env.NODE_ENV === 'production' &&
      (err.message.startsWith('select') ||
        err.message.startsWith('insert') ||
        err.message.startsWith('update'))
    ) {
      // don't expose DB queries in production
      return new Error('Internal server error')
    }

    return err
  }
})
const startServer = apolloServer.start()
const graphQLHandler: NextApiHandler = async (req, res) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  )

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.end()
    return
  }

  const token = await jwt.getToken({
    req,
    signingKey
  })

  if (token) {
    // Signed in
    if (await isMember(token)) {
      await startServer
      return apolloServer.createHandler({
        path: '/api/graphql'
      })(req, res)
    } else {
      res.status(401).send('unauthorized')
    }
  } else if (process.env.NEXT_PUBLIC_REQUIRE_LOGIN !== 'true') {
    await startServer
    return apolloServer.createHandler({
      path: '/api/graphql'
    })(req, res)
  } else {
    // Not Signed in
    res.status(401).send('unauthorized')
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}
export default graphQLHandler
