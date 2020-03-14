// @flow
import React from 'react'
import { List } from 'antd'
import slugify from 'slugify'
import type {Layer} from '../../types/layer'

type Props = {|
  layers: Array<Layer>,
  showTitle: boolean,
  t: Function
|}

export default class LayerList extends React.Component<Props, void> {
  static defaultProps = {
    showTitle: true
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const { layers, showTitle, t } = this.props

    return (
      <List
        header={showTitle && (<h4>{t('Layers')}</h4>)}
        dataSource={layers}
        renderItem={layer => {
          const layerId = layer && layer.layer_id ? layer.layer_id : 0
          const slugName = slugify(t(layer.name))
          return (
            <List.Item
              actions={[
                <a key='open-layer-map' href={`/layer/map/${layerId}/${slugName}`}><i className='material-icons'>map</i></a>,
                <a key='open-layer-info' href={`/layer/info/${layerId}/${slugName}`}><i className='material-icons'>info</i></a>]}
            >
              <span>
                {t(layer.name)}
              </span>
            </List.Item>
          )
        }}
      />
    )
  }
}
