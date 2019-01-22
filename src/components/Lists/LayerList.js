// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import slugify from 'slugify'
import type {Layer} from '../../types/layer'
import _isequal from 'lodash.isequal'

type Props = {|
  layers: Array<Layer>,
  showTitle: boolean
|}

export default class LayerList extends MapHubsComponent<Props, void> {
  static defaultProps = {
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
    const {t} = this
    let title = ''
    let className = 'collection'
    if (this.props.showTitle) {
      className = 'collection with-header'
      title = (
        <li className='collection-header'>
          <h4>{t('Layers')}</h4>
        </li>
      )
    }

    return (
      <ul className={className}>
        {title}
        {this.props.layers.map((layer, i) => {
          const layerId = layer && layer.layer_id ? layer.layer_id : 0
          const slugName = slugify(this.t(layer.name))
          return (
            <li className='collection-item' key={layerId}>
              <div>{this.t(layer.name)}
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
