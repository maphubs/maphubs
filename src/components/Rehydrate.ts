import Reflux from 'reflux'

Reflux.rehydrate = (str, data) => {
  const store = Reflux.initStore(str)

  if (!store.hydrated || typeof window === 'undefined') {
    // always rehydrate during SSR
    store.setState(data)
    store.hydrated = true
    return store
  }
}

export default Reflux
export function initStore(str) {
  str.prototype.rehydrate = function (state) {
    this.setState(state)
  }

  return Reflux.initStore(str)
}
export function createActions(actions) {
  const rehydrateActions = ['rehydrate']
  actions = rehydrateActions.concat(actions)
  return Reflux.createActions(actions)
}