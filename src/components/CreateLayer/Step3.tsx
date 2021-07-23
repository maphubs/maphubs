import React from 'react'
import LayerStyle from './LayerStyle'
import { useDispatch } from '../../redux/hooks'
import { setComplete } from '../../redux/reducers/layerSlice'

type Props = {
  onSubmit: (layer_id: number, name: string) => void
  mapConfig: Record<string, any>
}

const Step3 = ({ mapConfig, onSubmit }: Props): JSX.Element => {
  const dispatch = useDispatch()
  return (
    <LayerStyle
      waitForTileInit
      mapConfig={mapConfig}
      onSubmit={async (layer_id: number, name: string) => {
        await dispatch(setComplete())
        if (onSubmit) onSubmit(layer_id, name)
      }}
    />
  )
}
export default Step3
