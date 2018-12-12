// @flow
import React from 'react'
import _isequal from 'lodash.isequal'

type Props = {|
  groups: Array<Object>,
  showTitle: boolean,
  t: Function
|}

export default class GroupList extends React.Component<Props, void> {
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
    const {t, showTitle, groups} = this.props
    const className = showTitle ? 'collection with-header' : 'collection'
    return (
      <ul className={className}>
        {showTitle &&
          <li className='collection-header'>
            <h4>{t('Groups')}</h4>
          </li>
        }
        {groups.map((group, i) => {
          const groupName = t(group.name)
          return (
            <li className='collection-item' key={group.group_id}>
              <div>{groupName}
                <a className='secondary-content' href={'/group/' + group.group_id}>
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
