// @flow
import React from 'react'
import Header from '../components/header'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {CardConfig} from '../components/CardCarousel/Card'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import {Tooltip} from 'react-tippy'

type Props = {
  group: Group,
  maps: Array<Object>,
  layers: Array<Object>,
  hubs: Array<Object>,
  members: Array<Object>,
  canEdit: boolean,
  headerConfig: Object,
  locale: string,
  _csrf: string,
  user: Object
}

type State = {
  mapCards: Array<CardConfig>,
  layerCards: Array<CardConfig>,
  hubCards: Array<CardConfig>
}

export default class GroupInfo extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    maps: [],
    layers: [],
    hubs: [],
    members: [],
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {
      mapCards: this.props.maps.map(cardUtil.getMapCard),
      layerCards: this.props.layers.map(cardUtil.getLayerCard),
      hubCards: this.props.hubs.map(cardUtil.getHubCard)
    }
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.menuButton, {hoverEnabled: false})
  }

  render () {
    const _this = this
    const groupId = this.props.group.group_id ? this.props.group.group_id : ''
    let editButton = ''

    if (this.props.canEdit) {
      editButton = (
        <div ref={(el) => { this.menuButton = el }}className='fixed-action-btn action-button-bottom-right'>
          <a className='btn-floating btn-large red red-text'>
            <i className='large material-icons'>more_vert</i>
          </a>
          <ul>
            <li>
              <FloatingButton
                href='/createlayer' icon='add' color='green'
                tooltip={this.__('Add New Layer')} tooltipPosition='left' />
            </li>
            <li>
              <FloatingButton
                href={`/group/${groupId}/admin`} icon='settings' color='blue'
                tooltip={this.__('Manage Group')} tooltipPosition='left' />
            </li>
          </ul>
        </div>
      )

      var addButtons = (
        <div className='valign-wrapper'>
          <a className='btn valign' style={{margin: 'auto'}} href={'/map/new?group_id=' + groupId}>{this.__('Make a Map')}</a>
          <a className='btn valign' style={{margin: 'auto'}} href={'/createlayer?group_id=' + groupId}>{this.__('Add a Layer')}</a>
          <a className='btn valign' style={{margin: 'auto'}} href={'/createhub?group_id=' + groupId}>{this.__('Create a Hub')}</a>
        </div>
      )
    }

    let unofficial = ''
    if (this.props.group.unofficial) {
      unofficial = (
        <div className='row'>
          <p><b>{this.__('Unofficial Group')}</b> - {this.__('This group is maintained by Maphubs using public data and is not intended to represent the listed organization. If you represent this group and would like to take ownership please contact us.')}</p>
        </div>
      )
    }

    let descriptionWithLinks = ''

    if (this.props.group.description) {
      const localizedDescription = this._o_(this.props.group.description)
      // regex for detecting links
      const regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>")
    }
    let status = this.__('DRAFT')
    if (this.props.group.published) {
      status = this.__('Published')
    }

    const allCards = cardUtil.combineCards([this.state.mapCards, this.state.layerCards, this.state.hubCards])

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <h4>{this._o_(this.props.group.name)}</h4>
          <div className='row'>
            <div className='col s6'>
              <img alt={this.__('Group Photo')} width='300' className='' src={'/img/resize/600?url=/group/' + groupId + '/image'} />
            </div>
            <div className='col s6'>
              <div className='row'>
                <p><b>{this.__('Description: ')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}} />
              </div>
              <div className='row'>
                <p><b>{this.__('Status: ')}</b>{status}</p>
              </div>
              <div className='row'>
                <p><b>{this.__('Location: ')}</b>{this.props.group.location}</p>
              </div>
              {unofficial}
            </div>

          </div>
          <div className='divider' />
          <div className='row'>
            <div className='row'>
              <CardCarousel cards={allCards} infinite={false} />
            </div>
            {addButtons}
          </div>
        </div>
        <div className='divider' />
        <div className='container'>
          <div>
            <ul className='collection with-header'>
              <li className='collection-header'>
                <h5>{this.__('Members')}</h5>
              </li>
              {this.props.members.map(function (user, i) {
                let icon = ''
                if (user.role === 'Administrator') {
                  icon = (
                    <Tooltip
                      title={_this.__('Group Administrator')}
                      position='top' inertia followCursor>
                      <i className='secondary-content material-icons'>
                        supervisor_account
                      </i>
                    </Tooltip>
                  )
                }
                let image = ''
                if (user.image) {
                  image = (<img alt={this.__('Profile Photo')} className='circle' src={user.image} />)
                } else {
                  image = (<i className='material-icons circle'>person</i>)
                }
                return (
                  <li className='collection-item avatar' key={user.id}>
                    {image}
                    <span className='title'>{user.display_name}</span>
                    {icon}
                  </li>
                )
              })}
            </ul>
          </div>
          {editButton}
        </div>
      </ErrorBoundary>
    )
  }
}
