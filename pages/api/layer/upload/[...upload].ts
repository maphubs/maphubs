import type { NextApiHandler } from 'next'
import jwt from 'next-auth/jwt'
import { isMember } from '../../../../src/auth/check-user'

import tus from 'tus-node-server'
import { EVENTS } from 'tus-node-server'
import express from 'express'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('layer tus-server upload')

const signingKey = process.env.JWT_SIGNING_PRIVATE_KEY

const UPLOAD_PATH = `${process.env.TEMP_FILE_PATH}/uploads`

const metadataStringToObject = (stringValue) => {
  const keyValuePairList = stringValue.split(',')
  const metadata = {}
  for (const keyValuePair of keyValuePairList) {
    const [key, base64Value] = keyValuePair.split(' ')
    metadata[key] = Buffer.from(base64Value, 'base64').toString('ascii')
  }
  return metadata
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const handler: NextApiHandler = async (req, res) => {
  const user = (await jwt.getToken({
    req,
    signingKey
  })) as { sub: string }

  if (
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true' &&
    (!user?.sub || !isMember(user))
  ) {
    return res.status(401).json({
      error: 'Login required'
    })
  }

  const server = new tus.Server()
  server.datastore = new tus.FileStore({
    path: '/' + UPLOAD_PATH
    //relativeLocation: true
  })

  //const uploadApp = express()
  //uploadApp.all('*', server.handle.bind(server))
  server.on(EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
    console.log(event)
    console.log(`Upload complete for file ${event.file.id}`)
    const metadata = metadataStringToObject(event.file.upload_metadata)
    debug.log(metadata)
  })

  //return uploadApp(req, res)
  req.baseUrl = '/api/layer/upload'
  return await runMiddleware(req, res, server.handle.bind(server))
}

export default handler

export const config = {
  api: {
    bodyParser: false
  }
}
