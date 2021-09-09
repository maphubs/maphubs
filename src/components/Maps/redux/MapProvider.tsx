import React from 'react'
import { Provider } from 'react-redux'
import store from './store'
import { useSelector } from './hooks'
import mapboxgl from 'mapbox-gl'

type Props = {
  getMapboxMap?: (mapState: mapboxgl.Map) => void
  children: JSX.Element | JSX.Element[]
}

const MapWrapper = ({ getMapboxMap, children }: Props): JSX.Element => {
  const mapboxMap = useSelector((state) => state.map.mapboxMap)
  if (getMapboxMap) {
    getMapboxMap(mapboxMap)
  }
  return <>{children}</>
}

const MapProvider = ({ getMapboxMap, children }: Props): JSX.Element => {
  return (
    <Provider store={store}>
      <MapWrapper getMapboxMap={getMapboxMap}>{children}</MapWrapper>
    </Provider>
  )
}
export default MapProvider
