// @flow
import React from 'react'
import GroupTag from '../Groups/GroupTag'
import MapCardUserTag from './MapCardUserTag'
import StoryHeader from '../Story/StoryHeader'
import Lock from '@material-ui/icons/Lock'
import LockOpen from '@material-ui/icons/LockOpenTwoTone'
import {Tooltip} from 'react-tippy'
import {Card} from 'antd'

export type CardConfig = {|
  id: string,
  title?: LocalizedString,
  description?: LocalizedString,
  image_url?: string,
  background_image_url?: string,
  link: string,
  group?: string,
  data: Object,
  type: string,
  private?: boolean,
  public?: boolean,
  onClick?: Function
|}

type Props = {
  t: Function,
  showAddButton?: boolean
} & CardConfig

export default class MapHubsCard extends React.PureComponent<Props, void> {
  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data)
    } else if (this.props.link) {
      if (typeof window !== 'undefined') {
        window.location = this.props.link
      }
    }
  }

  render () {
    const {group, showAddButton, type, t, image_url} = this.props

    let iconName = ''
    let toolTipText = ''
    let mapCardUserTag = ''
    let storyTag = ''
    if (type) {
      if (type === 'layer') {
        iconName = 'layers'
        toolTipText = t('Layer')
      } else if (type === 'group') {
        iconName = 'supervisor_account'
        toolTipText = t('Group')
      } else if (type === 'hub') {
        iconName = 'web'
        toolTipText = 'Hub'
      } else if (type === 'story') {
        iconName = 'library_books'
        toolTipText = t('Story')
        storyTag = (
          <div style={{position: 'absolute', bottom: 1, left: 1, width: '200px'}}>
            <StoryHeader story={this.props.data} short />
          </div>
        )
      } else if (type === 'map') {
        iconName = 'map'
        toolTipText = t('Map')
        if (!this.props.group) {
          mapCardUserTag = (
            <div style={{position: 'absolute', bottom: 1, left: 1, width: '200px'}}>
              <MapCardUserTag map={this.props.data} />
            </div>
          )
        }
      }
    }

    let addButton = ''
    if (showAddButton) {
      addButton = (
        <a className='btn-floating halfway-fab waves-effect waves-light red'
          style={{top: '10px', right: '10px'}}>
          <i className='material-icons'>add</i>
        </a>
      )
    }
    let image = ''
    if (type === 'hub') {
      image = (
        <div className='card-image valign-wrapper' style={{height: '150px'}}>
          <img className='responsive-img' style={{position: 'absolute', objectFit: 'cover', height: '150px'}} src={this.props.background_image_url} />
          <img className='valign' width='75' height='75' style={{position: 'relative', width: '75px', borderRadius: '15px', margin: 'auto'}} src={image_url} />
          {addButton}
        </div>
      )
    } else if (type === 'story' && !image_url) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
          {addButton}
        </div>
      )
    } else if (type === 'story' && image_url) {
      image = (
        <div style={{height: '150px', width: '200px', backgroundImage: 'url(' + image_url + ')', backgroundSize: 'cover', backgroundPosition: 'center'}} >
          {addButton}
        </div>

      )
    } else if (type === 'group' && !image_url) {
      image = (
        <div className='card-image valign-wrapper' style={{width: '200px', height: '150px'}}>
          <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>supervisor_account</i>
          {addButton}
        </div>
      )
    } else if (type === 'group' && image_url) {
      image = (
        <div className='card-image'>
          <img className='responsive-img' style={{height: '150px', width: 'auto', margin: 'auto'}} src={image_url} />
          {addButton}
        </div>
      )
    } else {
      image = (
        <div className='card-image'>
          <img width='200' height='150' src={image_url} />
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
            <Tooltip
              title={t('Private')}
              position='bottom'
              inertia
              followCursor
            >
              <Lock style={{color: '#212121'}} />
            </Tooltip>
          </div>
        }
        {this.props.public &&
          <div style={{position: 'absolute', top: '5px', right: '5px'}}>
            <Tooltip
              title={t('Public Sharing Enabled')}
              position='bottom'
              inertia
              followCursor
            >
              <LockOpen style={{color: 'green'}} />
            </Tooltip>
          </div>
        }
        <div className='card-content word-wrap' style={{padding: '5px'}}>

          <b>{t(this.props.title)}</b> <br />

          <p className='fade' style={{fontSize: '12px'}}> {t(this.props.description)}</p>
          {mapCardUserTag}
          {storyTag}
          {group &&
            <div className='valign-wrapper' style={{position: 'absolute', bottom: 1, left: 1}}>
              <GroupTag group={group} />
            </div>
          }
          <Tooltip
            title={toolTipText}
            position='bottom'
            inertia
            followCursor
          >
            <i className='material-icons grey-text text-darken-3'
              style={{position: 'absolute', bottom: '6px', right: '6px'}}
            >
              {iconName}
            </i>
          </Tooltip>
        </div>
      </Card>
    )
  }
}
