/* eslint-disable no-case-declarations */
import { useMemo } from 'react'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import locale, { initialLocaleState } from './reducers/locale'

let store
const rootReducer = combineReducers({
  locale
})
const initialState = {
  locale: initialLocaleState
}

function initStore(preloadedState = initialState) {
  // don't parse Mapbox GL instance and  other large objects in Redux DevTools
  const composeEnhancers = composeWithDevTools({
    actionSanitizer: (action) => {
      return action
    },
    stateSanitizer: (state) => {
      const sanitizedState = {}

      return { ...state, ...sanitizedState }
    }
  })
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware())
  )
}

export const initializeStore = (preloadedState): any => {
  let _store = store ?? initStore(preloadedState)
  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({ ...store.getState(), ...preloadedState })
    // Reset the current store
    store = undefined
  }
  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store
  return _store
}

export function useStore(initialState): any {
  const store = useMemo(() => initializeStore(initialState), [initialState])
  return store
}
