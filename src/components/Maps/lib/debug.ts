import debug from 'debug'

const Debug = (name) => {
  const log = debug(`maphubs:${name}`)
  const error = debug(`maphubs-error:${name}`)
  if (typeof localStorage !== 'undefined') {
    localStorage.debug = 'maphubs:*, maphubs-error:*'
  }
  // log goes to stdout
  /* eslint-disable no-console */
  log.log = console.log.bind(console)

  return { log, error, info: log }
}
export default Debug
