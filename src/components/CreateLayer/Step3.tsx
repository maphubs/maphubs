import React from 'react'
import LayerStyle from './LayerStyle'
import LayerActions from '../../actions/LayerActions'

type Props = {
  onSubmit: (layer_id: number, name: string) => void
  mapConfig: Record<string, any>
}

const Step3 = ({ mapConfig, onSubmit }: Props): JSX.Element => {
  return (
    <LayerStyle
      waitForTileInit
      mapConfig={mapConfig}
      onSubmit={(layer_id: number, name: string) => {
        LayerActions.setComplete(() => {
          if (onSubmit) onSubmit(layer_id, name)
        })
      }}
    />
  )
}
export default Step3
