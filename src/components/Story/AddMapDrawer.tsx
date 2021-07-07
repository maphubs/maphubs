import React from 'react'
import { Drawer, Row, Divider, message, notification } from 'antd'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import request from 'superagent'
import cardUtil from '../../services/card-util'
import CardCarousel from '../CardCarousel/CardCarousel'
import SearchBox from '../SearchBox'
import { checkClientError } from '../../services/client-error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { LocalizedString } from '../../types/LocalizedString'
const debug = DebugService('AddMapToStory')
type Props = {
  visible?: boolean
  onClose: (...args: Array<any>) => void
  onAdd: (...args: Array<any>) => void
  myMaps: Array<Record<string, any>>
  popularMaps: Array<Record<string, any>>
  t: (v: string | LocalizedString) => string
}
type State = {
  searchActive: boolean
  searchResults: Array<Record<string, any>>
}
export default class AddMapDrawer extends React.Component<Props, State> {
  static defaultProps: {
    myMaps: Array<any>
    popularMaps: Array<any>
  } = {
    myMaps: [],
    popularMaps: []
  }
  state: State = {
    searchActive: false,
    searchResults: []
  }
  handleSearch: (input: string) => void = (input: string) => {
    const { props, setState } = this
    const { t } = props

    debug.log('searching for: ' + input)
    request
      .get(urlUtil.getBaseUrl() + '/api/maps/search?q=' + input)
      .type('json')
      .accept('json')
      .end((err, res) => {
        checkClientError(
          res,
          err,
          (err) => {
            if (err) {
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              if (res.body.maps && res.body.maps.length > 0) {
                setState({
                  searchActive: true,
                  searchResults: res.body.maps
                })

                message.info(`${res.body.maps.length} ${t('Results')}`)
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
  resetSearch: () => void = () => {
    this.setState({
      searchActive: false,
      searchResults: []
    })
  }

  render(): JSX.Element {
    const { resetSearch, handleSearch, state, props } = this
    const { visible, onClose, onAdd, myMaps, popularMaps, t } = props
    const { searchActive, searchResults } = state
    const myCards = myMaps.map((map, i) => cardUtil.getMapCard(map, onAdd))
    const popularCards = popularMaps.map((map, i) =>
      cardUtil.getMapCard(map, onAdd)
    )
    const searchCards = searchResults.map((map, i) =>
      cardUtil.getMapCard(map, onAdd)
    )
    return (
      <Drawer
        title={t('Add Map')}
        placement='bottom'
        height='100vh'
        closable
        destroyOnClose
        bodyStyle={{
          height: 'calc(100vh - 55px)',
          padding: '0px'
        }}
        onClose={onClose}
        visible={visible}
      >
        <Row
          style={{
            marginTop: '10px',
            marginBottom: '20px',
            marginRight: '35px',
            marginLeft: '0px'
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              margin: 'auto'
            }}
          >
            <SearchBox
              label={t('Search Maps')}
              suggestionUrl='/api/maps/search/suggestions'
              onSearch={handleSearch}
              onReset={resetSearch}
            />
          </div>
        </Row>
        <Row
          style={{
            height: 'calc(100% - 55px)',
            width: '100%',
            overflow: 'auto',
            paddingRight: '3%',
            paddingLeft: '3%'
          }}
        >
          {searchActive && (
            <Row>
              <h5
                style={{
                  fontSize: '1.3rem',
                  margin: '5px'
                }}
              >
                {t('Search Results')}
              </h5>
              <Divider />
              {searchResults.length > 0 && (
                <CardCarousel cards={searchCards} t={t} />
              )}
              {searchResults.length === 0 && (
                <p>
                  <b>{t('No Results Found')}</b>
                </p>
              )}
            </Row>
          )}
          {myMaps.length > 0 && (
            <Row
              style={{
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <h5
                style={{
                  fontSize: '1.3rem',
                  margin: '5px'
                }}
              >
                {t('My Maps')}
              </h5>
              <div className='divider' />
              <CardCarousel cards={myCards} t={t} />
            </Row>
          )}
          <Row>
            <h5
              style={{
                fontSize: '1.3rem',
                margin: '5px'
              }}
            >
              {t('Popular Maps')}
            </h5>
            <Divider />
            <CardCarousel cards={popularCards} t={t} />
          </Row>
        </Row>
      </Drawer>
    )
  }
}
