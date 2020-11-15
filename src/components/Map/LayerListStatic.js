// @flow
import type {Element} from "React";import React from 'react'
import LayerListItemStatic from './LayerListItemStatic'
import _isEqual from 'lodash.isequal'
import type {Layer} from '../../types/layer'

type Props = {|
  layers: Array<Object>,
  toggleVisibility: Function,
  t: Function
|}

type State = {
  layers: Array<Layer>
}

export default class LayerListStatic extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    let layers = []
    if (props.layers) {
      layers = JSON.parse(JSON.stringify(props.layers))
    }

    this.state = {
      layers
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!_isEqual(nextProps.layers, this.state.layers)) {
      const layers = JSON.parse(JSON.stringify(nextProps.layers))
      this.setState({layers})
    }
  }

  render (): Element<"div"> {
    const {t, toggleVisibility} = this.props
    const {layers} = this.state
    return (
      <div style={{height: '100%', padding: 0, margin: 0, width: '200px'}}>
        <ul ref='layers' style={{height: '100%', overflow: 'auto'}} className='collection no-margin custom-scroll-bar'>{
          layers.map((layer) => {
            if (layer && layer.layer_id && layer.layer_id > 0) {
              return (
                <li key={layer.layer_id}>
                  <LayerListItemStatic
                    item={layer}
                    toggleVisibility={toggleVisibility}
                    t={t}
                  />
                </li>
              )
            }
          })
        }
        </ul>
      </div>
    )
  }
}
