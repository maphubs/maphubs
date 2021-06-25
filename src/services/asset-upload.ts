import request from 'superagent'
import getConfig from 'next/config'
const config = getConfig()
const MAPHUBS_CONFIG = config ? config.publicRuntimeConfig : {}

module.exports = async (mhid: string, imageData: string): Promise<unknown> => {
  const host = MAPHUBS_CONFIG.host
    ? MAPHUBS_CONFIG.host.replace(/\./g, '')
    : 'unknownhost'

  if (
    !MAPHUBS_CONFIG.ASSET_UPLOAD_API ||
    !MAPHUBS_CONFIG.ASSET_UPLOAD_API_KEY
  ) {
    throw new Error('Missing ASSET API config')
  }

  const apiUrl = `${MAPHUBS_CONFIG.ASSET_UPLOAD_API}/image/upload`
  const token = MAPHUBS_CONFIG.ASSET_UPLOAD_API_KEY
  const res = await request
    .post(apiUrl)
    .set('authorization', token ? `Bearer ${token}` : null)
    .type('json')
    .accept('json')
    .send({
      image: imageData,
      options: {
        subfolder: `${host}-features`,
        subfolderID: mhid
      }
    })
  const result = res.body
  return result
}