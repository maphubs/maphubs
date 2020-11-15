// @flow
import type {Node} from "React";import React from 'react'
import SearchBox from '../SearchBox'
import { Row, Col, Divider, Select, message, notification } from 'antd'
import CardCarousel from '../CardCarousel/CardCarousel'
import request from 'superagent'
import {checkClientError} from '../../services/client-error-response'
import cardUtil from '../../services/card-util'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import type {Layer} from '../../types/layer'
import type {Group} from '../../stores/GroupStore'
const debug = DebugService('mapmaker/addlayerpanel')

const { Option } = Select

type Props = {
  myLayers: Array<Layer>,
  popularLayers: Array<Layer>,
  groups: Array<Group>,
  onAdd: Function,
  t: Function
}

type State = {
  searchResults: Array<Layer>,
  searchActive: boolean,
  selectedGroupId?: string
}

export default class AddLayerPanel extends React.Component<Props, State> {
  props: Props

  state: State = {
    searchResults: [],
    searchActive: false,
    selectedGroupId: undefined
  }

  shouldComponentUpdate (nextProps: Props, nextState: State): boolean {
    if (nextState.searchActive !== this.state.searchActive) return true
    if (nextState.selectedGroupId !== this.state.selectedGroupId) return true
    if (nextState.searchResults.length > 0 || this.state.searchResults.length > 0) return true
    return false
  }

  handleSearch: ((input: string) => void) = (input: string) => {
    const {t} = this.props
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers})
              message.info(`${res.body.layers.length} ${t('Results')}`)
            } else {
              message.info(t('No Results Found'), 5)
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  handleGroupSearch: ((group_id: string) => void) = (group_id: string) => {
    const {t} = this.props
    if (!group_id) {
      this.resetSearch()
      return
    }
    const _this = this
    debug.log(`searching for group: ${group_id}`)
    request.get(`${urlUtil.getBaseUrl()}/api/layers/group/${group_id}`)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers, selectedGroupId: group_id})
              message.info(`${res.body.layers.length} ${t('Results')}`)
            } else {
              message.info(t('No Results Found'), 5)
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  resetSearch: (() => void) = () => {
    this.setState({searchActive: false, searchResults: [], selectedGroupId: undefined})
  }

  render (): Node {
    const { t, myLayers, popularLayers, onAdd, groups } = this.props
    const { searchActive, searchResults, selectedGroupId } = this.state

    let myCards = []
    if (myLayers && myLayers.length > 0) {
      myCards = myLayers.map((layer, i) => cardUtil.getLayerCard(layer, i, [], onAdd))
    }

    const popularCards = popularLayers.map((layer, i) => cardUtil.getLayerCard(layer, i, [], onAdd))

    let searchResultDisplay = ''
    let searchCards = []
    if (searchActive) {
      searchCards = searchResults.map((layer, i) => cardUtil.getLayerCard(layer, i, [], onAdd))
      searchResultDisplay = (
        <Row>
          <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
          <Divider />
          {searchCards.length > 0 &&
            <CardCarousel cards={searchCards} showAddButton t={t} />}
          {searchCards.length === 0 &&
            <p><b>{t('No Results Found')}</b></p>}
        </Row>
      )
    }

    return (
      <Row style={{height: '100%', width: '100%'}}>
        <Row style={{width: '100%'}}>
          <Col span={12} style={{padding: '20px'}}>
            <SearchBox label={t('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
          </Col>
          <Col span={12} style={{padding: '22px'}}>
            <Select
              showSearch
              defaultValue={selectedGroupId}
              onChange={this.handleGroupSearch}
              allowClear
              placeholder={t('or Select a Group')}
              style={{ width: '100%' }}
              filterOption={(input, option) => {
                // eslint-disable-next-line unicorn/prefer-includes
                return option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }}
            >
              {groups.map((group) =>
                <Option key={group.group_id} value={group.group_id}>{t(group.name)}</Option>
              )}
            </Select>
            <style jsx global>{`
              .ant-select-dropdown-menu-item-active:not(.ant-select-dropdown-menu-item-disabled) {
                color: #FFF;
              }
            `}
            </style>
          </Col>
        </Row>
        <Row style={{height: 'calc(100% - 100px)', width: '100%', overflowY: 'auto', padding: '10px'}}>
          {searchResultDisplay}
          {myCards.length > 0 &&
            <Row style={{width: '100%'}}>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('My Layers')}</h5>
              <Divider />
              <CardCarousel cards={myCards} showAddButton t={t} />
            </Row>}
          <Row style={{width: '100%'}}>
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Popular Layers')}</h5>
            <Divider />
            <CardCarousel cards={popularCards} showAddButton t={t} />
          </Row>
        </Row>
      </Row>
    )
  }
}
