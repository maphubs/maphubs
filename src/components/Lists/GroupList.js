// @flow
import type {Node} from "React";import React from 'react'
import { List, Avatar } from 'antd'
import _isequal from 'lodash.isequal'
import InfoIcon from '@material-ui/icons/Info'

type Props = {|
  groups: Array<Object>,
  showTitle: boolean,
  t: Function
|}

export default class GroupList extends React.Component<Props, void> {
  static defaultProps: {|showTitle: boolean|} = {
    showTitle: true
  }

  shouldComponentUpdate (nextProps: Props): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  render (): Node {
    const {t, showTitle, groups} = this.props

    return (
      <List
        header={showTitle && (<b>{t('Groups')}</b>)}
        dataSource={groups}
        bordered
        style={{width: '100%', maxWidth: '800px'}}
        renderItem={group => (
          <List.Item
            actions={[
              <a key='open-group-icon' href={`/group/${group.group_id}`}><InfoIcon /></a>]}
          >
            <List.Item.Meta
              avatar={
                <a href={`/group/${group.group_id}`}>
                  <Avatar
                    alt={t(group.name)} shape='square' size={64} src={`/img/resize/128?url=/group/${group.group_id}/image.png`}
                  />
                </a>
              }
              title={t(group.name)}
              description={t(group.description)}
            />
          </List.Item>
        )}
      />
    )
  }
}
