import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd'
import Select from '../forms/select'
import CreateGroupModal from '../CreateGroup/CreateGroupModal'
import { Group } from '../../types/group'
import useT from '../../hooks/useT'
type Props = {
  groups: Array<Group>
  group_id?: string
  canChangeGroup: boolean
  editing?: boolean
  onGroupChange?: (id: string) => void
}

const SelectGroup = ({
  group_id,
  groups,
  canChangeGroup,
  onGroupChange
}: Props): JSX.Element => {
  const { t } = useT()
  const [groupID, setGroupID] = useState(group_id)
  const [createdGroup, setCreatedGroup] = useState<Group>()

  useEffect(() => {
    setGroupID(group_id)
  }, [group_id])

  const getSelectedGroup = (group_id: string): Group => {
    let selected
    for (const group of groups) {
      if (group.group_id === group_id) {
        selected = group
      }
    }
    return selected
  }

  const groupChange = (selectedID: string): void => {
    setGroupID(selectedID)

    if (onGroupChange) {
      onGroupChange(selectedID)
    }
  }

  let startEmpty = true
  let selectedGroup

  if (groupID) {
    startEmpty = false
    selectedGroup = getSelectedGroup(groupID)
  }

  const groupOptions = groups.map((group) => {
    return {
      value: group.group_id,
      label: t(group.name)
    }
  })
  return (
    <>
      {canChangeGroup && !createdGroup && (
        <Row>
          <Select
            name='group'
            id='group-select'
            label={t('Group')}
            startEmpty={startEmpty}
            value={group_id}
            onChange={groupChange}
            emptyText={t('Choose a Group')}
            options={groupOptions}
            required
          />
          <Row
            style={{
              padding: '5px',
              marginTop: '10px'
            }}
          >
            <Col span={16}>
              <p
                style={{
                  fontSize: '12px'
                }}
              >
                {t(
                  'Since you are in multiple groups, please select the group that should own this item.'
                )}
              </p>
            </Col>
            <Col
              span={8}
              style={{
                padding: '5px'
              }}
            >
              <CreateGroupModal
                t={t}
                onCreate={(createdGroup) => {
                  setCreatedGroup(createdGroup)
                  groupChange(createdGroup.group_id)
                }}
              />
            </Col>
          </Row>
        </Row>
      )}
      {canChangeGroup && createdGroup && (
        <p>
          <b>{t('Created Group:')} </b>
          {t(createdGroup.name)}
        </p>
      )}
      {!canChangeGroup && selectedGroup && (
        <p>
          <b>{t('Group:')} </b>
          {t(selectedGroup.name)}
        </p>
      )}
    </>
  )
}
SelectGroup.defaultProps = {
  canChangeGroup: true
}
export default SelectGroup
