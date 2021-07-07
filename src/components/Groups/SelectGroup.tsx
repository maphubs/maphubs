import React from 'react'
import { Row, Col } from 'antd'
import _isequal from 'lodash.isequal'
import Select from '../forms/select'

import CreateGroupModal from '../CreateGroup/CreateGroupModal'
import type { Group } from '../../stores/GroupStore'
type Props = {
  groups: Array<Group>
  group_id?: string
  canChangeGroup: boolean
  private: boolean
  editing: boolean
  onGroupChange?: (...args: Array<any>) => any
}
type State = {
  group_id?: string
  private: boolean
  createdGroup?: Record<string, any>
}
export default class SelectGroup extends React.Component<Props, State> {
  static defaultProps = {
    canChangeGroup: true,
    private: true,
    editing: false
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      group_id: props.group_id,
      private: props.private
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.group_id !== this.props.group_id) {
      this.setState({
        group_id: nextProps.group_id
      })
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  getSelectedGroup = (group_id: string): Record<string, any> => {
    let selected = {}
    for (const group of this.props.groups) {
      if (group.group_id === group_id) {
        selected = group
      }
    }
    return selected
  }
  onGroupChange = (group_id: string): void => {
    this.setState({
      group_id
    })

    if (this.props.onGroupChange) {
      this.props.onGroupChange(group_id)
    }
  }

  render(): JSX.Element {
    const { t, onGroupChange, props, state } = this
    const { groups, canChangeGroup } = props
    const { group_id, createdGroup } = state
    let startEmpty = true
    let selectedGroup

    if (group_id) {
      startEmpty = false
      selectedGroup = this.getSelectedGroup(group_id)
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
              onChange={onGroupChange}
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
                    this.setState({
                      createdGroup,
                      group_id: createdGroup.group_id
                    })
                    this.onGroupChange(createdGroup.group_id)
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
}
