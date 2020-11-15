// @flow
import type {Node} from "React";import React from 'react'
import GroupTag from '../Groups/GroupTag'
import Lock from '@material-ui/icons/Lock'
import AddCircle from '@material-ui/icons/AddCircle'
import LockOpen from '@material-ui/icons/LockOpenTwoTone'
import { Card, Tooltip } from 'antd'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import MapIcon from '@material-ui/icons/Map'
import LayersIcon from '@material-ui/icons/Layers'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'

export type CardConfig = {
  id: string,
  title?: LocalizedString,
  description?: LocalizedString,
  showDescription?: boolean,
  image_url?: string,
  link: string,
  group: {
    group_id: string
  },
  data: Object,
  type: string,
  private?: boolean,
  public?: boolean,
  draft?: boolean,
  onClick?: Function
}

type Props = {
  t: Function,
  showAddButton?: boolean
} & CardConfig

type State = {
  imageFailed?: boolean
}

export default class MapHubsCard extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  onClick: (() => void) = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data)
    } else if (this.props.link) {
      if (typeof window !== 'undefined') {
        window.location = this.props.link
      }
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State): boolean {
    if (nextState.imageFailed && !this.state.imageFailed) return true
    return false
  }

  onImageFailed: (() => void) = () => {
    this.setState({imageFailed: true})
  }

  render (): Node {
    const {group, showAddButton, type, t, image_url, showDescription, id} = this.props
    const { imageFailed } = this.state

    let icon = ''
    let toolTipText = ''
    const iconStyle = {position: 'absolute', bottom: '6px', right: '6px'}
    if (type) {
      if (type === 'layer') {
        icon = <LayersIcon style={iconStyle} />
        toolTipText = t('Layer')
      } else if (type === 'group') {
        icon = <SupervisorAccountIcon style={iconStyle} />
        toolTipText = t('Group')
      } else if (type === 'story') {
        icon = <LibraryBooksIcon style={iconStyle} />
        toolTipText = t('Story')
      } else if (type === 'map') {
        icon = <MapIcon style={iconStyle} />
        toolTipText = t('Map')
      }
    }

    let addButton = ''
    if (showAddButton) {
      addButton = (
        <a
          style={{position: 'absolute', top: '10px', right: '10px'}}
        >
          <AddCircle style={{fontSize: '32px', color: 'red'}} />
        </a>
      )
    }
    let image = ''
    if (type === 'story' && (!image_url || imageFailed)) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <LibraryBooksIcon className='omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}} />
          {addButton}
        </div>
      )
    } else if (type === 'story' && image_url) {
      image = (
        <div style={{height: '150px', width: '200px', backgroundImage: 'url(' + image_url + ')', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          {addButton}
        </div>

      )
    } else if (type === 'group' && (!image_url || imageFailed)) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <SupervisorAccountIcon className='omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}} />
          {addButton}
        </div>
      )
    } else if (type === 'group' && image_url) {
      image = (
        <div className='card-image'>
          <img className='responsive-img' style={{height: '150px', width: 'auto', margin: 'auto'}} src={image_url} onError={this.onImageFailed} />
          {addButton}
        </div>
      )
    } else if (type === 'layer' && (!image_url || imageFailed)) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <LayersIcon className='omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}} />
          {addButton}
        </div>
      )
    } else if (type === 'map' && (!image_url || imageFailed)) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <MapIcon className='omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}} />
          {addButton}
        </div>
      )
    } else {
      image = (
        <div className='card-image'>
          <img width='200' height='150' src={image_url} onError={this.onImageFailed} />
          {addButton}
        </div>
      )
    }

    return (
      <Card
        hoverable
        style={{ width: 200, height: 300 }}
        onClick={this.onClick}
        bodyStyle={{height: '100%', padding: '0'}}
        id={id}
      >
        <style jsx global>{`
          .card-image {
            border-bottom: 1px solid #757575;
            display: flex;
          }
        `}
        </style>
        {image}

        {this.props.private &&
          <div style={{position: 'absolute', top: '5px', right: '5px'}}>
            <Tooltip title={t('Private')} placement='bottom'>
              <Lock style={{color: '#323333'}} />
            </Tooltip>
          </div>}
        <div className='card-content word-wrap' style={{height: '150x', padding: '5px'}}>

          <b>{t(this.props.title)}</b> <br />
          {
            showDescription &&
              <p className='fade' style={{fontSize: '12px'}}> {t(this.props.description)}</p>
          }
          {group &&
            <div className='valign-wrapper' style={{position: 'absolute', bottom: 5, left: 5}}>
              <GroupTag group={group.group_id} />
            </div>}
          {this.props.public &&
            <div style={{position: 'absolute', bottom: '2px', right: '30px'}}>
              <Tooltip
                title={t('Public Sharing Enabled')}
                placement='top'
              >
                <LockOpen style={{color: 'green'}} />
              </Tooltip>
            </div>}
          {this.props.draft &&
            <>
              <div style={{position: 'absolute', top: '5px', right: '75px'}}>
                <span style={{color: 'red', fontWeight: 600}}>{t('DRAFT')}</span>
              </div>
              <div style={{position: 'absolute', bottom: '5px', right: '75px'}}>
                <span style={{color: 'red', fontWeight: 600}}>{t('DRAFT')}</span>
              </div>
            </>}
          <Tooltip title={toolTipText} placement='top'>
            {icon}
          </Tooltip>
        </div>
      </Card>
    )
  }
}
