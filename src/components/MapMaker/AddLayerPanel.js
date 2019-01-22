// @flow
import React from 'react'
import SearchBox from '../SearchBox'
import CardCarousel from '../CardCarousel/CardCarousel'
import request from 'superagent'
import Formsy from 'formsy-react'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import Select from '../forms/select'
import {checkClientError} from '../../services/client-error-response'
import cardUtil from '../../services/card-util'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import type {Layer} from '../../types/layer'
import type {Group} from '../../stores/GroupStore'
const debug = DebugService('mapmaker/addlayerpanel')

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

  state = {
    searchResults: [],
    searchActive: false,
    selectedGroupId: undefined
  }

  handleSearch = (input: string) => {
    const {t} = this.props
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/layers/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers})
              NotificationActions.showNotification({message: res.body.layers.length + ' ' + t('Results'), position: 'topright'})
            } else {
            // show error message
              NotificationActions.showNotification({message: t('No Results Found'), dismissAfter: 5000, position: 'topright'})
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  handleGroupSearch = (group_id: string) => {
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
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            if (res.body.layers && res.body.layers.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.layers, selectedGroupId: group_id})
              NotificationActions.showNotification({message: res.body.layers.length + ' ' + t('Results'), position: 'topright'})
            } else {
            // show error message
              NotificationActions.showNotification({message: t('No Results Found'), dismissAfter: 5000, position: 'topright'})
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: [], selectedGroupId: undefined})
  }

  render () {
    const {t, myLayers, popularLayers, onAdd} = this.props
    const _this = this
    let myCards = []
    let popularCards = []
    let myLayersDisplay = ''

    const cardCarouselStops = [
      {breakpoint: 600, settings: {slidesToShow: 1, slidesToScroll: 1}},
      {breakpoint: 950, settings: {slidesToShow: 2, slidesToScroll: 2}},
      {breakpoint: 1150, settings: {slidesToShow: 3, slidesToScroll: 3}},
      {breakpoint: 1400, settings: {slidesToShow: 4, slidesToScroll: 4}},
      {breakpoint: 1700, settings: {slidesToShow: 5, slidesToScroll: 5}},
      {breakpoint: 2500, settings: {slidesToShow: 6, slidesToScroll: 6}},
      {breakpoint: 4000, settings: {slidesToShow: 8, slidesToScroll: 8}}
    ]

    if (myLayers && myLayers.length > 0) {
      myCards = myLayers.map((layer, i) => {
        return cardUtil.getLayerCard(layer, i, [], onAdd)
      })
      myLayersDisplay = (
        <div className='row'>
          <div className='col s12'>
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('My Layers')}</h5>
            <div className='divider' />
            <CardCarousel cards={myCards} infinite={false} responsive={cardCarouselStops} showAddButton t={t} />
          </div>
        </div>
      )
    }

    popularCards = popularLayers.map((layer, i) => {
      return cardUtil.getLayerCard(layer, i, [], _this.props.onAdd)
    })

    let searchResults = ''
    let searchCards = []
    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        searchCards = this.state.searchResults.map((layer, i) => {
          return cardUtil.getLayerCard(layer, i, [], _this.props.onAdd)
        })
        searchResults = (
          <div className='row'>
            <div className='col s12'>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
              <div className='divider' />
              <CardCarousel infinite={false} cards={searchCards} responsive={cardCarouselStops} showAddButton t={t} />
            </div>
          </div>
        )
      } else {
        searchResults = (
          <div className='row'>
            <div className='col s12'>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
              <div className='divider' />
              <p><b>{t('No Results Found')}</b></p>
            </div>
          </div>
        )
      }
    }

    const groupOptions = []
    if (this.props.groups) {
      this.props.groups.map((group) => {
        groupOptions.push({
          value: group.group_id,
          label: t(group.name)
        })
      })
    }

    return (
      <div style={{paddingTop: '10px'}}>
        <div className='row no-margin'>
          <div className='col s6'>
            <SearchBox label={t('Search Layers')} suggestionUrl='/api/layers/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
          </div>
          <div className='col s6'>
            <Formsy >
              <Select name='group' id='group-select' startEmpty
                value={this.state.selectedGroupId} onChange={this.handleGroupSearch}
                emptyText={t('or Select a Group')} options={groupOptions} className='col s12'
                required
              />
            </Formsy>
          </div>
        </div>
        <div>
          {searchResults}
          {myLayersDisplay}
          <div className='row'>
            <div className='col s12'>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Popular Layers')}</h5>
              <div className='divider' />
              <CardCarousel cards={popularCards} infinite={false} responsive={cardCarouselStops} showAddButton t={t} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
