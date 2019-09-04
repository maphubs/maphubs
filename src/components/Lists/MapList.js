// @flow
import React from 'react'
import slugify from 'slugify'
import _isequal from 'lodash.isequal'

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
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  render () {
    const {t, showTitle, maps} = this.props
    const className = showTitle ? 'collection with-header' : 'collection'

    return (
      <ul className={className}>
        {showTitle &&
          <li className='collection-header'>
            <h4>{t('Maps')}</h4>
          </li>}
        {maps.map((map, i) => {
          const mapTitle = t(map.title)
          const slugTitle = slugify(mapTitle)
          return (
            <li className='collection-item' key={map.map_id}>
              <div>{mapTitle}
                <a className='secondary-content' href={`/map/view/${map.map_id}/${slugTitle}`}>
                  <i className='material-icons'>map</i>
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
