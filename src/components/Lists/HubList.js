// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'

type Props = {|
  hubs: Array<Object>,
  showTitle: boolean
|}

type DefaultProps = {
  showTitle: boolean
}

export default class HubList extends MapHubsComponent<Props, void> {
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
    const {t} = this
    let title = ''
    let className = 'collection'
    if (this.props.showTitle) {
      className = 'collection with-header'
      title = (
        <li className='collection-header'>
          <h4>{t('Hubs')}</h4>
        </li>
      )
    }

    return (
      <ul className={className}>
        {title}
        {this.props.hubs.map((hub, i) => {
          return (
            <li className='collection-item' key={hub.hub_id}>
              <div>{hub.name}
                <a className='secondary-content' href={'/hub/' + hub.hub_id}>
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
