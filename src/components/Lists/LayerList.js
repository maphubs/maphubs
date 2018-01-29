// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import slugify from 'slugify'
import type {Layer} from '../../stores/layer-store'
import _isequal from 'lodash.isequal'

type Props = {|
  layers: Array<Layer>,
  showTitle: boolean
|}

type DefaultProps = {
  showTitle: boolean
}

export default class LayerList extends MapHubsComponent<Props, void> {
  static defaultProps: DefaultProps = {
    showTitle: true
  }

  shouldComponentUpdate (nextProps: Props) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  render () {
    let title = ''
    let className = 'collection'
    if (this.props.showTitle) {
      className = 'collection with-header'
      title = (
        <li className='collection-header'>
          <h4>{this.__('Layers')}</h4>
        </li>
      )
    }

    return (
      <ul className={className}>
        {title}
        {this.props.layers.map((layer, i) => {
          const layerId = layer && layer.layer_id ? layer.layer_id : 0
          const slugName = slugify(this._o_(layer.name))
          return (
            <li className='collection-item' key={layerId}>
              <div>{this._o_(layer.name)}
                <a className='secondary-content' href={`/layer/map/${layerId}/${slugName}`}>
                  <i className='material-icons'>map</i>
                </a>
                <a className='secondary-content' href={`/layer/info/${layerId}/${slugName}`}>
                  <i className='material-icons'>info</i>
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
