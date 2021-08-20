import React from 'react'
import { Provider } from 'react-redux'
import store from './store'

const MapProvider = ({
  children
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  return <Provider store={store}>{children}</Provider>
}
export default MapProvider
