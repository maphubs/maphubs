export default {
  getBaseUrl(): string {
    const host = process.env.NEXT_PUBLIC_EXTERNAL_HOST
    const port = process.env.NEXT_PUBLIC_EXTERNAL_PORT
    let proto = 'http://'
    if (process.env.NEXT_PUBLIC_HTTPS) proto = 'https://'
    let url = proto + host

    if (port !== 80) {
      url += ':' + port
    }

    return url
  }
}
