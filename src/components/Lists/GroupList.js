// @flow
import React from 'react'
import { List } from 'antd'
import _isequal from 'lodash.isequal'
import InfoIcon from '@material-ui/icons/Info'

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

    return (
      <List
        header={showTitle && (<b>{t('Groups')}</b>)}
        dataSource={groups}
        bordered
        renderItem={group => (
          <List.Item
            actions={[
              <a key='open-group-info' href={`/group/${group.group_id}`}><InfoIcon /></a>]}
          >
            <span>
              {t(group.name)}
            </span>
          </List.Item>
        )}
      />
    )
  }
}
