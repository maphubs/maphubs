import request from 'superagent'

export default async (
  mhid: string,
  imageData: string
): Promise<{ webpcheckURL: string }> => {
  const host = process.env.NEXT_PUBLIC_EXTERNAL_HOST
    ? process.env.NEXT_PUBLIC_EXTERNAL_HOST.replace(/\./g, '')
    : 'unknownhost'

  if (
    !process.env.NEXT_PUBLIC_ASSET_UPLOAD_API ||
    !process.env.NEXT_PUBLIC_ASSET_UPLOAD_API_KEY
  ) {
    throw new Error('Missing ASSET API config')
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_ASSET_UPLOAD_API}/image/upload`
  const token = process.env.NEXT_PUBLIC_ASSET_UPLOAD_API_KEY
  const res = await request
    .post(apiUrl)
    .set('authorization', `Bearer ${token}`)
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
