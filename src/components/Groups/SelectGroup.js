// @flow
import React from 'react'
import { Row } from 'antd'
import _isequal from 'lodash.isequal'
import Select from '../forms/select'
import MapHubsComponent from '../../components/MapHubsComponent'

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
  private: boolean
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

  getOwnerGroup = (group_id: string): Object => {
    let owner = {}
    this.props.groups.forEach((group) => {
      if (group.group_id === group_id) {
        owner = group
      }
    })
    return owner
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
    const { group_id } = this.state
    let startEmpty = true
    let owner
    if (group_id) {
      startEmpty = false
      owner = this.getOwnerGroup(group_id)
    }

    const groupOptions = groups.map((group) => {
      return {
        value: group.group_id,
        label: t(group.name)
      }
    })

    return (
      <>
        {(groups.length > 1 && canChangeGroup) &&
          <Row>
            <Select name='group' id='group-select' label={t('Group')} startEmpty={startEmpty}
              value={this.state.group_id} onChange={this.onGroupChange}
              emptyText={t('Choose a Group')} options={groupOptions} className='col s12'
              dataPosition='right' dataTooltip={t('Owned by Group')}
              required
            />
            <p style={{padding: '10px', fontSize: '12px', marginTop: '10px'}}>{t('Since you are in multiple groups, please select the group that should own this item.')}</p>
          </Row>
        }
        {((groups.length === 1 || !canChangeGroup) && owner) &&
          <p><b>{t('Group:')} </b>{this.t(owner.name)}</p>
        }
        {(groups.length === 1 && !group_id) &&
          <p><b>{t('Group:')} </b>{this.t(this.props.groups[0].name)}</p>
        }
      </>
    )
  }
}
