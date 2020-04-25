// @flow
import React from 'react'
import slugify from 'slugify'
import { List, Avatar } from 'antd'
import MapIcon from '@material-ui/icons/Map'

type Props = {|
  maps: Array<Object>,
  showTitle: boolean,
  t: Function
|}

export default class MapList extends React.Component<Props, void> {
  static defaultProps = {
    showTitle: true
  }

  shouldComponentUpdate (nextProps: Props) {
    return false
  }

  render () {
    const {t, showTitle, maps} = this.props

    return (
      <List
        header={showTitle ? <b>{t('Maps')}</b> : undefined}
        bordered
        dataSource={maps}
        style={{width: '100%', maxWidth: '800px'}}
        renderItem={map => {
          const mapTitle = t(map.title)
          const slugTitle = slugify(mapTitle)
          return (
            <List.Item
              actions={[<a key='map' href={`/map/view/${map.map_id}/${slugTitle}`}><MapIcon /></a>]}
            >
              <div>
                <List.Item.Meta
                  avatar={
                    <a href={`/map/view/${map.map_id}/${slugTitle}`}>
                      <Avatar
                        alt={mapTitle} shape='square' size={64} src={`/img/resize/128?format=webp&url=/api/screenshot/map/thumbnail/${map.map_id}.jpg`}
                      />
                    </a>
                  }
                  title={mapTitle}
                />
              </div>
            </List.Item>
          )
        }}
      />
    )
  }
}
