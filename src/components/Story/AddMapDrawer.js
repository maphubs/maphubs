// @flow
import React from 'react'
import { Drawer, Row, Divider, message, notification } from 'antd'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import request from 'superagent'
import cardUtil from '../../services/card-util'
import CardCarousel from '../CardCarousel/CardCarousel'
import SearchBox from '../SearchBox'
import {checkClientError} from '../../services/client-error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('AddMapToStory')

type Props = {
  visible?: boolean,
  onClose: Function,
  onAdd: Function,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  t: Function
}

type State = {
  searchActive: boolean,
  searchResults: Array<Object>
}

export default class AddMapDrawer extends React.Component<Props, State> {
  static defaultProps = {
    myMaps: [],
    popularMaps: []
  }

  state = {
    searchActive: false,
    searchResults: []
  }

  handleSearch = (input: string) => {
    const { t } = this.props
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
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
            if (res.body.maps && res.body.maps.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.maps})
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

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []})
  }

  render () {
    const { resetSearch, handleSearch } = this
    const { visible, onClose, onAdd, myMaps, popularMaps, t } = this.props
    const { searchActive, searchResults } = this.state

    const myCards = myMaps.map((map, i) => cardUtil.getMapCard(map, i, [], onAdd))
    const popularCards = popularMaps.map((map, i) => cardUtil.getMapCard(map, i, [], onAdd))
    const searchCards = searchResults.map((map, i) => cardUtil.getMapCard(map, i, [], onAdd))

    return (
      <Drawer
        title={t('Add Map')}
        placement='bottom'
        height={`100vh`}
        closable
        destroyOnClose
        bodyStyle={{ height: 'calc(100vh - 55px)', padding: '0px' }}
        onClose={onClose}
        visible={visible}
      >
        <Row style={{marginTop: '10px', marginBottom: '10px', marginRight: '35px', marginLeft: '0px'}}>
          <SearchBox label={t('Search Maps')} suggestionUrl='/api/maps/search/suggestions' onSearch={handleSearch} onReset={resetSearch} />
        </Row>
        <Row style={{height: 'calc(100% - 55px)', width: '100%', overflow: 'auto', paddingRight: '3%', paddingLeft: '3%'}}>
          {searchActive &&
            <Row>
              <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Search Results')}</h5>
              <Divider />
              {searchResults.length > 0 &&
                <CardCarousel infinite={false} cards={searchCards} t={t} />
              }
              {searchResults.length === 0 &&
                <p><b>{t('No Results Found')}</b></p>
              }
            </Row>
          }
          {(myMaps && myMaps.length > 0) &&
            <div className='row' style={{width: '100%'}}>
              <div className='col s12 no-padding' style={{width: '100%'}}>
                <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('My Maps')}</h5>
                <div className='divider' />
                <CardCarousel cards={myCards} infinite={false} t={t} />
              </div>
            </div>
          }
          <Row>
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{t('Popular Maps')}</h5>
            <Divider />
            <CardCarousel cards={popularCards} infinite={false} t={t} />
          </Row>
        </Row>
      </Drawer>
    )
  }
}
