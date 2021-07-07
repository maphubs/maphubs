import React from 'react'
import { List, Avatar } from 'antd'
import InfoIcon from '@material-ui/icons/Info'
import { LocalizedString } from '../../types/LocalizedString'
import { Group } from '../../types/group'

type Props = {
  groups: Group[]
  showTitle: boolean
  t: (v: string | LocalizedString) => string
}

const GroupList = ({ t, showTitle, groups }: Props): JSX.Element => {
  return (
    <List
      header={showTitle && <b>{t('Groups')}</b>}
      dataSource={groups}
      bordered
      style={{
        width: '100%',
        maxWidth: '800px'
      }}
      renderItem={(group) => (
        <List.Item
          actions={[
            <a key='open-group-icon' href={`/group/${group.group_id}`}>
              <InfoIcon />
            </a>
          ]}
        >
          <List.Item.Meta
            avatar={
              <a href={`/group/${group.group_id}`}>
                <Avatar
                  alt={t(group.name)}
                  shape='square'
                  size={64}
                  src={`/group/${group.group_id}/image.png`}
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
GroupList.defaultProps = {
  showTitle: true
}
export default GroupList
