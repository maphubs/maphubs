import { ApolloServer, gql } from 'apollo-server-micro'
import { isMember } from '../../src/auth/check-user'
import resolvers from '../../src/graphql/resolvers'
import { importSchema } from 'graphql-import'
import jwt from 'next-auth/jwt'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import { NextApiRequest, NextApiResponse } from 'next'
import local from '../../src/config'

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY
const schema = importSchema('./src/graphql/schema.graphql')
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
      err.message.startsWith('select')
    ) {
      // don't expose DB queries in production
      return new Error('Internal server error')
    }

    return err
  }
})
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
}
export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const token = await jwt.getToken({
    req,
    signingKey
  })

  if (token) {
    // Signed in
    if (await isMember(token)) {
      return apolloServer.createHandler({
        path: '/api/graphql'
      })(req, res)
    } else {
      res.status(401).send('unauthorized')
    }
  } else if (!local.requireLogin) {
    return apolloServer.createHandler({
      path: '/api/graphql'
    })(req, res)
  } else {
    // Not Signed in
    res.status(401).send('unauthorized')
  }
}
