import React from 'react'
import { Provider } from 'react-redux'
import { MapState } from './reducers/mapSlice'
import store from './store'

const MapProvider = ({
  getMapState,
  children
}: {
  getMapState?: (mapState: MapState) => void
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  if (getMapState) {
    const state = store.getState()
    console.log(state)
    getMapState(state.map)
  }
  return <Provider store={store}>{children}</Provider>
}
export default MapProvider
