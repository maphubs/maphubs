// @flow
import React from 'react'
import InteractiveMap from '../components/InteractiveMap'
import Header from '../components/header'
import ConfirmationActions from '../actions/ConfirmationActions'
import NotificationActions from '../actions/NotificationActions'
import MessageActions from '../actions/MessageActions'
import MapMakerActions from '../actions/MapMakerActions'
import Progress from '../components/Progress'
import urlUtil from '../services/url-util'
import UserStore from '../stores/UserStore'
import request from 'superagent'
import MapMakerStore from '../stores/MapMakerStore'
import debounce from 'lodash.debounce'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import fireResizeEvent from '../services/fire-resize-event'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {UserStoreState} from '../stores/UserStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import PublicShareModal from '../components/InteractiveMap/PublicShareModal'
import CopyMapModal from '../components/InteractiveMap/CopyMapModal'
import ErrorBoundary from '../components/ErrorBoundary'
import {Tooltip} from 'react-tippy'
import FloatingButton from '../components/FloatingButton'

const $ = require('jquery')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  map: Object,
  layers: Array<Object>,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object,
  user: Object
}

type DefaultProps = {
  canEdit: boolean
}

type UserMapState = {
  width: number,
  height: number,
  downloading: boolean,
  share_id?: string
}

type State = LocaleStoreState & UserStoreState & UserMapState

export default class UserMap extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  props: Props

  static defaultProps: DefaultProps = {
    canEdit: false
  }

  state: State = {
    width: 1024,
    height: 600,
    downloading: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
    this.stores.push(MapMakerStore)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (this.props.map.share_id) {
      this.state.share_id = this.props.map.share_id
    }
  }

  componentWillMount () {
    super.componentWillMount()
    const _this = this

    if (typeof window === 'undefined') return // only run this on the client

    function getSize () {
      // Get the dimensions of the viewport
      const width = Math.floor($(window).width())
      const height = $(window).height()
      // var height = Math.floor(width * 0.75); //4:3 aspect ratio
      // var height = Math.floor((width * 9)/16); //16:9 aspect ratio
      return {width, height}
    }

    const size = getSize()
    this.setState({
      width: size.width,
      height: size.height
    })

    $(window).resize(() => {
      debounce(() => {
        const size = getSize()
        _this.setState({
          width: size.width,
          height: size.height
        })
      }, 300)
    })
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
    this.clipboard = require('clipboard-polyfill')
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    debounce(() => {
      fireResizeEvent()
    }, 300)
    if (this.state.user && !prevState.user) {
      M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
    }
  }

  onMouseEnterMenu = () => {
    // still needed?
  }

  onDelete = () => {
    const _this = this
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of ') + this._o_(this.props.map.title),
      onPositiveResponse () {
        MapMakerActions.deleteMap(_this.props.map.map_id, _this.state._csrf, (err) => {
          if (err) {
            MessageActions.showMessage({title: _this.__('Server Error'), message: err})
          } else {
            window.location = '/maps'
          }
        })
      }
    })
  }

  onEdit = () => {
    window.location = '/map/edit/' + this.props.map.map_id
    // CreateMapActions.showMapDesigner();
  }

  onFullScreen = () => {
    let fullScreenLink = `/api/map/${this.props.map.map_id}/static/render`
    if (window.location.hash) {
      fullScreenLink = fullScreenLink += window.location.hash
    }
    window.location = fullScreenLink
  }

  onMapChanged = () => {
    location.reload()
  }

  postToMedium = () => {
    alert('coming soon')
  }

  download = () => {
    const _this = this
    if (!this.props.map.has_screenshot) {
      // warn the user if we need to wait for the screenshot to be created
      this.setState({downloading: true})
      setTimeout(() => { _this.setState({downloading: false}) }, 15000)
    }
  }

  copyToClipboard = (val: string) => {
    this.clipboard.writeText(val)
  }

  showEmbedCode = () => {
    const baseUrl = urlUtil.getBaseUrl()
    let url
    if (this.props.map.share_id) {
      url = `${baseUrl}/map/public-embed/${this.props.map.share_id}/static`
    } else {
      url = `${baseUrl}/map/embed/${this.props.map.map_id}/static`
    }

    const code = `
      &lt;iframe src="${url}"
        style="width: 100%; height: 350px;" frameborder="0" 
        allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"
        &gt;
      &lt;/iframe&gt;
    `
    const messageIntro = this.__('Paste the following code into your website to embed a map:')
    const message = `<p>${messageIntro}</p><pre style="height: 200px; overflow: auto">${code}</pre>`

    MessageActions.showMessage({title: this.__('Embed Code'), message})
  }

  showSharePublic = () => {
    // show modal
    this.refs.publicShareModal.show()
  }

  toggleSharePublic = (value: boolean) => {
    const _this = this
    MapMakerActions.setPublic(this.props.map.map_id, value, this.state._csrf, (shareId) => {
      _this.setState({share_id: shareId})
    })
  }

  showCopyMap = () => {
    // show modal
    this.refs.copyMapModal.show()
  }

  onCopyMap = (formData: Object, cb: Function) => {
    const _this = this
    const data = {
      map_id: this.props.map.map_id,
      title: formData.title,
      group_id: formData.group,
      _csrf: this.state._csrf
    }

    request.post('/api/map/copy')
      .type('json').accept('json')
      .send(data)
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err || !res.body || !res.body.map_id) {
            MessageActions.showMessage({title: _this.__('Error'), message: err})
          } else {
            const mapId = res.body.map_id
            const url = '/map/edit/' + mapId
            NotificationActions.showNotification({
              message: _this.__('Map Copied'),
              dismissAfter: 2000,
              onDismiss () {
                cb()
                window.location = url
              }
            })
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  render () {
    let deleteButton = ''
    let editButton = ''
    let shareButton = ''
    let shareModal = ''
    if (this.props.canEdit) {
      deleteButton = (
        <li>
          <FloatingButton color='red' icon='delete' large={false}
            onClick={this.onDelete} tooltip={this.__('Delete Map')}
          />
        </li>
      )
      editButton = (
        <li>
          <FloatingButton color='blue' icon='mode_edit' large={false}
            onClick={this.onEdit} tooltip={this.__('Edit Map')}
          />
        </li>
      )

      if (MAPHUBS_CONFIG.mapHubsPro) {
        shareButton = (
          <li>
            <FloatingButton color='green' icon='share' large={false}
              onClick={this.showSharePublic} tooltip={this.__('Share')}
            />
          </li>
        )
        shareModal = (
          <PublicShareModal ref='publicShareModal' share_id={this.state.share_id} onChange={this.toggleSharePublic} />
        )
      }
    }

    let copyButton = ''
    let copyModal = ''
    if (this.state.user) {
      copyButton = (
        <li>
          <FloatingButton color='purple' icon='queue' large={false}
            onClick={this.showCopyMap} tooltip={this.__('Copy Map')}
          />
        </li>
      )

      const copyMapTitle = JSON.parse(JSON.stringify(this.props.map.title))
      copyMapTitle.en = copyMapTitle.en + ' - Copy'
      // TODO: change copied map title in other languages

      copyModal = (
        <CopyMapModal ref='copyMapModal' title={copyMapTitle} onSubmit={this.onCopyMap} />
      )
    }

    const download = `${this._o_(this.props.map.title)} - ${MAPHUBS_CONFIG.productName}.png`
    const downloadHREF = `/api/screenshot/map/${this.props.map.map_id}.png`

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <Progress id='load-data-progess' title={this.__('Preparing Download')} subTitle={''} dismissible={false} show={this.state.downloading} />
          <InteractiveMap height='calc(100vh - 50px)'
            {...this.props.map}
            layers={this.props.layers}
            mapConfig={this.props.mapConfig}
            disableScrollZoom={false}
            {...this.props.map.settings}
          />
          <div ref={(ref) => { this.menuButton = ref }} id='user-map-button' className='fixed-action-btn' style={{bottom: '40px'}}
            onMouseEnter={this.onMouseEnterMenu}
          >
            <a className='btn-floating btn-large'>
              <i className='large material-icons'>more_vert</i>
            </a>
            <ul>
              {shareButton}
              {deleteButton}
              {editButton}
              {copyButton}
              <li>
                <Tooltip
                  title={this.__('Get Map as a PNG Image')}
                  position='left' inertia followCursor>
                  <a onClick={this.download}
                    download={download} href={downloadHREF}
                    className='btn-floating green'>
                    <i className='material-icons'>insert_photo</i>
                  </a>
                </Tooltip>
              </li>
              <li>
                <FloatingButton color='orange' icon='code' large={false}
                  onClick={this.showEmbedCode} tooltip={this.__('Embed')}
                />
              </li>
              <li>
                <FloatingButton color='yellow' icon='print' large={false}
                  onClick={this.onFullScreen} tooltip={this.__('Print/Screenshot')}
                />
              </li>
            </ul>
          </div>
          {shareModal}
          {copyModal}
        </main>
      </ErrorBoundary>
    )
  }
}
