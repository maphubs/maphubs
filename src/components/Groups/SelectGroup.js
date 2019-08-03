// @flow
import React from 'react'
import { Row, Col } from 'antd'
import _isequal from 'lodash.isequal'
import Select from '../forms/select'
import MapHubsComponent from '../MapHubsComponent'
import CreateGroupModal from '../CreateGroup/CreateGroupModal'

import type {Group} from '../../stores/GroupStore'

type Props = {
    groups: Array<Group>,
    type: string,
    group_id?: string,
    canChangeGroup: boolean,
    private: boolean,
    editing: boolean,
    onGroupChange?: Function
};

type State = {
  group_id?: string,
  private: boolean,
  createdGroup?: Object
}

export default class SelectGroup extends MapHubsComponent<Props, State> {
  static defaultProps = {
    canChangeGroup: true,
    private: true,
    editing: false
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      group_id: props.group_id,
      private: props.private
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.group_id !== this.props.group_id) {
      this.setState({group_id: nextProps.group_id})
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  getSelectedGroup = (group_id: string): Object => {
    let selected = {}
    this.props.groups.forEach((group) => {
      if (group.group_id === group_id) {
        selected = group
      }
    })
    return selected
  }

  onGroupChange = (group_id: string) => {
    this.setState({group_id})
    if (this.props.onGroupChange) {
      this.props.onGroupChange(group_id)
    }
  }

  render () {
    const {t} = this
    const { groups, canChangeGroup } = this.props
    const { group_id, createdGroup } = this.state
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
        {(canChangeGroup && !createdGroup) &&
          <Row>
            <Select name='group' id='group-select' label={t('Group')} startEmpty={startEmpty}
              value={this.state.group_id} onChange={this.onGroupChange}
              emptyText={t('Choose a Group')} options={groupOptions} className='col s12'
              dataPosition='right' dataTooltip={t('Owned by Group')}
              required
            />
            <Row style={{padding: '10px', marginTop: '10px'}}>
              <Col span={18}>
                <p style={{fontSize: '12px'}}>{t('Since you are in multiple groups, please select the group that should own this item.')}</p>
              </Col>
              <Col span={6} style={{padding: '10px'}}>
                <CreateGroupModal t={t} onCreate={(createdGroup) => {
                  this.setState({createdGroup, group_id: createdGroup.group_id})
                  this.onGroupChange(createdGroup.group_id)
                }}
                />
              </Col>
            </Row>
          </Row>
        }
        {(canChangeGroup && createdGroup) &&
          <p><b>{t('Created Group:')} </b>{t(createdGroup.name)}</p>
        }
        {(!canChangeGroup && selectedGroup) &&
          <p><b>{t('Group:')} </b>{t(selectedGroup.name)}</p>
        }
      </>
    )
  }
}
