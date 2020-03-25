// @flow
import React from 'react'
import slugify from 'slugify'
import { List } from 'antd'
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
        renderItem={map => {
          const mapTitle = t(map.title)
          const slugTitle = slugify(mapTitle)
          return (
            <List.Item
              actions={[<a key='map' href={`/map/view/${map.map_id}/${slugTitle}`}><MapIcon /></a>]}
            >
              <div>
                {mapTitle}
              </div>
            </List.Item>
          )
        }}
      />
    )
  }
}
